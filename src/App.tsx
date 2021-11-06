import { HSConnection, HSNode, ModelOutput, run } from "hotstuff-network";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Point } from "./utils/pointUtils";
import Sidebar from "./components/Sidebar/Sidebar";
import Plot from "./components/Plot/Plot";
import config from "./config";
import useWindowSize from "./components/Canvas/hooks/useWindowSize";
import Canvas, { SavedCanvasState } from "./components/Canvas/Canvas";
import useDraw from "./hooks/useDraw";
import useDoubleClick from "./hooks/useDoubleClick";
import useNodeConnectionUtils from "./hooks/useNodeConnectionUtils";
import useOnMouseDown from "./hooks/useOnMouseDown";
import useKeyDown from "./hooks/useKeyDown";
import { defaultAppState } from "./default";
import useLocalStorageState from "./hooks/useLocalStorageState";

const {
  editorWidthPerc,
  canvasHeightPerc,
  plotMargin,
  tabHeightPx,
  plotHeightBufferPx,
} = config;

export type Direction = "L" | "R" | "U" | "D";

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
  isActive: boolean;
  textDirection: Direction;
};

export type AppConnection = HSConnection & {
  sourceName: string;
  targetName: string;
};

export type Timing = {
  timeStepS: number;
  totalTimeS: number;
};

export type AppState = {
  output?: ModelOutput;
  timing: Timing;
  nodes: AppNode[];
  connections: AppConnection[];
  savedCanvasState: SavedCanvasState;
};

const StyledApp = styled.div<{ height: number }>`
  display: flex;
  height: ${(props) => props.height}px;
  user-select: none;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
`;

const StyledWorkspace = styled.div<{ height: number; width: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => (1 - editorWidthPerc) * props.width}px;
`;

const StyledCanvas = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
`;

export default function App(): React.ReactElement {
  const [appState, setAppState] = useLocalStorageState<AppState>(
    defaultAppState,
    "hotstuffAppState"
  );

  const setAppNodes = useCallback(
    (newNodes: AppNode[]) => {
      setAppState((prevState) => ({
        ...prevState,
        nodes: newNodes,
      }));
    },
    [setAppState]
  );

  const setAppConnections = useCallback(
    (newConnections: AppConnection[]) => {
      setAppState((prevState) => ({
        ...prevState,
        connections: newConnections,
      }));
    },
    [setAppState]
  );

  const setSavedCanvasState = useCallback(
    (newSavedCanvasState: SavedCanvasState) => {
      setAppState((prevState) => ({
        ...prevState,
        savedCanvasState: newSavedCanvasState,
      }));
    },
    [setAppState]
  );

  const setTiming = useCallback(
    (newTiming: Timing) => {
      setAppState((prevState) => ({
        ...prevState,
        timing: newTiming,
      }));
    },
    [setAppState]
  );

  const setModelOutput = useCallback(
    (newModelOutput: ModelOutput) => {
      setAppState((prevState) => ({
        ...prevState,
        output: newModelOutput,
      }));
    },
    [setAppState]
  );

  const [
    addNode,
    updateNodes,
    deleteNodes,
    updateConnections,
    deleteConnections,
    setActiveNodes,
    clearActiveNodes,
  ] = useNodeConnectionUtils(
    appState.nodes,
    setAppNodes,
    appState.connections,
    setAppConnections
  );

  const [keyboardActive, setKeyboardActive] = useState<boolean>(true);
  useKeyDown(keyboardActive, appState.nodes, setAppNodes, deleteNodes);

  const [draw, clearAndRedraw] = useDraw(appState.nodes, appState.connections);
  const handleDoubleClick = useDoubleClick(
    appState.nodes,
    addNode,
    updateNodes
  );
  const onMouseDown = useOnMouseDown(
    appState.nodes,
    appState.connections,
    setAppConnections,
    updateNodes,
    setActiveNodes,
    clearActiveNodes,
    clearAndRedraw
  );

  const [size, ratio] = useWindowSize();
  const [windowWidth, windowHeight] = size;

  // width/heights
  const workspaceWidth = windowWidth;
  const workspaceHeight = windowHeight;
  const canvasHeight = windowHeight * canvasHeightPerc;
  const canvasWidth = windowWidth * (1 - editorWidthPerc);
  const plotHeight =
    (1 - canvasHeightPerc) * windowHeight - tabHeightPx - plotHeightBufferPx;
  const plotWidth = canvasWidth;
  const editorWidth = editorWidthPerc * windowWidth;

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
            savedCanvasState={appState.savedCanvasState}
            setSavedCanvasState={setSavedCanvasState}
            setKeyboardActive={setKeyboardActive}
          />
        </StyledCanvas>
        <Plot
          plotDimensions={{
            height: plotHeight,
            width: plotWidth,
            margin: plotMargin,
          }}
          modelOutput={appState.output}
        />
      </StyledWorkspace>
      <Sidebar
        height={windowHeight}
        width={editorWidth}
        timing={appState.timing}
        setTiming={setTiming}
        nodes={appState.nodes}
        connections={appState.connections}
        // addNode={addNode}
        updateNodes={updateNodes}
        deleteNodes={deleteNodes}
        updateConnections={updateConnections}
        deleteConnections={deleteConnections}
        onRunModel={() => {
          const output = run({
            nodes: appState.nodes,
            connections: appState.connections,
            timeStepS: appState.timing.timeStepS,
            totalTimeS: appState.timing.totalTimeS,
          });
          if (output.errors?.length) {
            output.errors.forEach((error) => console.error(error.message));
          }
          setModelOutput(output);
        }}
      />
    </StyledApp>
  );
}
