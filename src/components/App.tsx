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
    center: { x: 100, y: 100 },
    radius: defaultNodeRadius,
    color: "red",
  },
  {
    ...test2,
    center: { x: 200, y: 200 },
    radius: defaultNodeRadius,
    color: "red",
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
  const [windowWidth, windowHeight] = useWindowSize();

  // // oh shit https://mariosfakiolas.com/blog/my-react-components-render-twice-and-drive-me-crazy/
  // const test = useRef(0);
  // alert(test.current);
  // test.current = 1;
  // alert(test.current);

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

  return (
    <StyledApp height={windowHeight}>
      <StyledWorkspace height={workspaceHeight} width={workspaceWidth}>
        <StyledCanvas height={canvasHeight}>
          <Canvas
            nodes={appNodes}
            connections={appConnections}
            addNode={(node: AppNode) => setAppNodes([...appNodes, node])}
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
          />
        </StyledCanvas>
        <Plot height={plotHeight} />
      </StyledWorkspace>
      <Editor height={windowHeight} width={editorWidth} />
    </StyledApp>
  );
}
