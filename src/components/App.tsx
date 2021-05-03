import {
  HSConnection,
  HSNode,
  makeConnection,
  makeNode,
  ModelOutput,
} from "hotstuff-network";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Point } from "./Canvas/pointUtils";
import Canvas from "./Canvas/Canvas";
import Editor from "./Editor/Editor";
import Plot from "./Plot/Plot";
import config from "../config";
import useWindowSize from "./Canvas/hooks/useWindowSize";
import SimpleCanvas from "./Canvas/SimpleCanvas";

const {
  defaultTimeStepSeconds,
  defaultTotalTimeSeconds,
  editorWidthPerc,
  canvasHeightPerc,
  defaultNodeRadius,
} = config;

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
  isActive: boolean;
};

export type AppConnection = HSConnection;

const StyledApp = styled.div<{ height: number }>`
  display: flex;
  height: ${(props) => props.height}px;
`;

const StyledWorkspace = styled.div<{ height: number; width: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => (1 - editorWidthPerc) * props.width}px;
`;

const StyledCanvas = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
`;

const test1 = makeNode({
  name: "test1",
  temperatureDegC: 20,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});

const test2 = makeNode({
  name: "test2",
  temperatureDegC: 50,
  capacitanceJPerDegK: 200,
  powerGenW: 0,
  isBoundary: false,
});

const testAppNodes: AppNode[] = [
  {
    ...test1,
    center: { x: 0, y: 0 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...test2,
    center: { x: 150, y: 150 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
];

const testAppConnections: AppConnection[] = [
  {
    ...makeConnection({
      source: test1,
      target: test2,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
  },
];

export default function App() {
  const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
    undefined
  );
  // hooks
  const [timeStepS, setTimeStepS] = useState(defaultTimeStepSeconds);
  const [totalTimeS, setTotalTimeS] = useState(defaultTotalTimeSeconds);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);
  const [size, ratio] = useWindowSize();

  const [windowWidth, windowHeight] = size;

  // width/heights
  const workspaceWidth = windowWidth;
  const workspaceHeight = windowHeight;
  const canvasHeight = windowHeight * canvasHeightPerc;
  const canvasWidth = windowWidth * (1 - editorWidthPerc);
  const plotHeight = (1 - canvasHeightPerc) * windowHeight;
  const editorWidth = editorWidthPerc * windowWidth;

  // TODO: REMOVE
  useEffect(() => {
    setAppNodes(testAppNodes);
    setAppConnections(testAppConnections);
  }, []);

  function addNode(node: AppNode) {
    const newNodes: AppNode[] = appNodes.map((node) => ({
      ...node,
      isActive: false,
    }));
    newNodes.push({ ...node, isActive: true });
    setAppNodes(newNodes);
  }

  function updateNode(updatedNode: AppNode) {
    const newNodes = appNodes.map((node) =>
      node.id === updatedNode.id ? updatedNode : node
    );
    setAppNodes(newNodes);
  }

  function setActiveNode(activeNodeId: string) {
    setAppNodes(
      appNodes.map((node) => ({
        ...node,
        isActive: node.id === activeNodeId ? true : false,
      }))
    );
  }

  function clearActiveNode() {
    setAppNodes(
      appNodes.map((node) => ({
        ...node,
        isActive: false,
      }))
    );
  }

  return (
    <StyledApp height={windowHeight}>
      <StyledWorkspace height={workspaceHeight} width={workspaceWidth}>
        <StyledCanvas height={canvasHeight}>
          <SimpleCanvas
            nodes={appNodes}
            connections={appConnections}
            addNode={addNode}
            updateNode={updateNode}
            setActiveNode={setActiveNode}
            clearActiveNode={clearActiveNode}
            canvasHeight={canvasHeight / ratio}
            canvasWidth={canvasWidth / ratio}
          />
        </StyledCanvas>
        <Plot height={plotHeight} />
      </StyledWorkspace>
      <Editor height={windowHeight} width={editorWidth} />
    </StyledApp>
  );
}
