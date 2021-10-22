import {
  HSConnection,
  HSNode,
  makeConnection,
  makeNode,
} from "hotstuff-network";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ORIGIN, Point } from "./components/Canvas/pointUtils";
import Sidebar from "./components/Sidebar/Sidebar";
import Plot from "./components/Plot/Plot";
import config from "./config";
import useWindowSize from "./components/Canvas/hooks/useWindowSize";
import Canvas, {
  CanvasState,
  SavedCanvasState,
} from "./components/Canvas/Canvas";
import {
  drawArrow,
  drawClearBox,
  drawConnection,
  drawNode,
  intersectsCircle,
  isInsideBox,
  mouseToNodeCoords,
} from "./components/Canvas/canvasUtils";
import useDraw from "./hooks/useDraw";
import useAddNode from "./hooks/useAddNode";
import useAddConnection from "./hooks/useAddConnection";
import useModelUtils from "./hooks/useModelUtils";
import useMoveNode from "./hooks/useMoveNode";
import useMultiSelect from "./hooks/useMultiSelect";

const {
  sidebarWidthPerc: editorWidthPerc,
  canvasHeightPerc,
  defaultNodeRadius,
  newNodeNamePrefix,
  defaultResistanceDegKPerW,
  defaultConnectionKind,
} = config;

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
  isActive: boolean;
};

export type AppConnection = HSConnection & {
  sourceName: string;
  targetName: string;
};

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
  isBoundary: true,
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
    center: { x: 200, y: 200 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...test2,
    center: { x: 650, y: 450 },
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
    sourceName: test1.name,
    targetName: test2.name,
  },
];

export default function App(): React.ReactElement {
  // const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
  //   undefined
  // );
  // const [timeStepS, setTimeStepS] = useState(defaultTimeStepSeconds);
  // const [totalTimeS, setTotalTimeS] = useState(defaultTotalTimeSeconds);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);
  const [
    addNode,
    updateNodes,
    deleteNodes,
    updateConnections,
    deleteConnections,
    updateActiveNodes,
    clearActiveNodes,
  ] = useModelUtils(appNodes, setAppNodes, appConnections, setAppConnections);
  const [draw, clearAndRedraw] = useDraw(appNodes, appConnections);
  const handleDoubleClick = useAddNode(appNodes, addNode);
  const makeNewConnection = useAddConnection(
    appNodes,
    appConnections,
    setAppConnections,
    clearAndRedraw
  );
  const moveNode = useMoveNode(updateNodes, clearAndRedraw);
  const multiSelect = useMultiSelect(
    appNodes,
    updateActiveNodes,
    clearAndRedraw
  );
  // const [activeNode, setActiveNode] = useState<AppNode | undefined>(undefined);
  const [savedCanvasState, setSavedCanvasState] = useState<SavedCanvasState>({
    offset: ORIGIN,
    scale: 1,
  });
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

  const onMouseDown = useCallback(
    (event, canvasState, defaultBehavior) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const activeNodeIds = appNodes
        .filter((node) => node.isActive)
        .map((node) => node.id);

      const clickedNode = appNodes.find((node) =>
        intersectsCircle(nodeCoordsOfMouse, node.center, node.radius)
      );

      if (clickedNode) {
        if (event.altKey) {
          makeNewConnection(event, clickedNode, canvasState);
        } else if (event.shiftKey && activeNodeIds.includes(clickedNode.id)) {
          updateActiveNodes(
            activeNodeIds.filter((id) => id !== clickedNode.id),
            false
          );
        } else {
          // clicked node without alt key - make active and/or drag node around
          moveNode(event, clickedNode, canvasState);
        }
      } else {
        if (event.shiftKey) {
          multiSelect(event, canvasState);
        } else {
          // clicked on canvas, not a node
          clearActiveNodes();
          defaultBehavior(event);
        }
      }
    },
    [
      appNodes,
      clearActiveNodes,
      moveNode,
      multiSelect,
      makeNewConnection,
      updateActiveNodes,
    ]
  );

  return (
    <StyledApp height={windowHeight}>
      <StyledWorkspace height={workspaceHeight} width={workspaceWidth}>
        <StyledCanvas height={canvasHeight}>
          <Canvas
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            devicePixelRatio={ratio}
            draw={draw}
            onMouseDown={onMouseDown}
            handleDoubleClick={handleDoubleClick}
            savedCanvasState={savedCanvasState}
            setSavedCanvasState={setSavedCanvasState}
          />
        </StyledCanvas>
        <Plot height={plotHeight} />
      </StyledWorkspace>
      <Sidebar
        height={windowHeight}
        width={editorWidth}
        nodes={appNodes}
        connections={appConnections}
        addNode={addNode}
        updateNodes={updateNodes}
        deleteNodes={deleteNodes}
        updateConnections={updateConnections}
        deleteConnections={deleteConnections}
        updateActiveNodes={updateActiveNodes}
        clearActiveNodes={clearActiveNodes}
      />
    </StyledApp>
  );
}
