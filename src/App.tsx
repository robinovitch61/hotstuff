import { HSConnection, HSNode, ModelOutput, run } from "hotstuff-network";
import React, { useCallback, useMemo, useState } from "react";
import { Point } from "./utils/pointUtils";
import Sidebar from "./components/Sidebar/Sidebar";
import Plot from "./components/Plot/Plot";
import config from "./config";
import useWindowSize from "./components/Canvas/hooks/useWindowSize";
import Canvas, { CanvasViewState } from "./components/Canvas/Canvas";
import useDraw from "./hooks/useDraw";
import useDoubleClick from "./hooks/useDoubleClick";
import useNodeConnectionUtils from "./hooks/useNodeConnectionUtils";
import useOnMouseDown from "./hooks/useOnMouseDown";
import useKeyDown from "./hooks/useKeyDown";
import { defaultAppState } from "./default";
import useSessionStorageState from "./hooks/useSessionStorageState";
import { getCanvasCenter } from "./components/Canvas/canvasUtils";
import {
  getNewAppConnection,
  getNewAppNode,
} from "./utils/nodeConnectionUtils";
import useAppStateModifiers from "./hooks/useAppStateModifiers";
import useResizablePanels from "./hooks/useResizablePanels";
import {
  StyledApp,
  StyledCanvas,
  StyledCanvasPlotBorder,
  StyledLeftRightBorder,
  StyledWorkspace,
} from "./style";

const { plotMargin, tabHeightPx, plotHeightBufferPx } = config;

export type Direction = "L" | "R" | "U" | "D";

export type AppNode = HSNode & {
  center: Point;
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

export type PanelSizes = {
  editorWidthFraction: number;
  canvasHeightFraction: number;
  tableHeightFraction: number;
};

export type AppState = {
  output?: ModelOutput;
  timing: Timing;
  nodes: AppNode[];
  connections: AppConnection[];
  canvasViewState: CanvasViewState;
  savedCanvasState: CanvasViewState;
  panelSizes: PanelSizes;
};

export default function App(): React.ReactElement {
  const [appState, setAppState] = useSessionStorageState<AppState>(
    defaultAppState,
    "hotstuffAppState"
  );

  const [
    setAppNodes,
    setAppConnections,
    setCanvasViewState,
    setSavedCanvasState,
    setTiming,
    setModelOutput,
  ] = useAppStateModifiers(setAppState);

  const [
    addNode,
    addConnection,
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
    setAppConnections,
    setModelOutput
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
    addConnection,
    updateNodes,
    setActiveNodes,
    clearActiveNodes,
    clearAndRedraw
  );

  const [size, ratio] = useWindowSize();
  const [windowWidth, windowHeight] = size;

  const [
    canvasPlotBorderRef,
    onMouseDownOnCanvasPlotBorder,
    leftRightBorderRef,
    onMouseDownOnLeftRightBorder,
    tableControlsBorderRef,
    onMouseDownOnTableControlsBorder,
  ] = useResizablePanels(setAppState, windowHeight, windowWidth);

  // width/heights
  const workspaceWidth = windowWidth;
  const workspaceHeight = windowHeight;
  const canvasHeight = windowHeight * appState.panelSizes.canvasHeightFraction;
  const canvasWidth =
    windowWidth * (1 - appState.panelSizes.editorWidthFraction);
  const plotHeight =
    (1 - appState.panelSizes.canvasHeightFraction) * windowHeight -
    tabHeightPx -
    plotHeightBufferPx;
  const plotWidth = canvasWidth;
  const editorWidth = appState.panelSizes.editorWidthFraction * windowWidth;

  const plot = useMemo(() => {
    return (
      <Plot
        plotDimensions={{
          height: plotHeight,
          width: plotWidth,
          margin: plotMargin,
        }}
        modelOutput={appState.output}
      />
    );
  }, [appState.output, plotHeight, plotWidth]);

  const addNodeInCenterOfCanvas = useCallback(() => {
    addNode(
      getNewAppNode(
        appState.nodes,
        getCanvasCenter(
          canvasWidth,
          canvasHeight,
          appState.canvasViewState.offset,
          appState.canvasViewState.scale
        )
      )
    );
  }, [
    addNode,
    appState.canvasViewState.offset,
    appState.canvasViewState.scale,
    appState.nodes,
    canvasHeight,
    canvasWidth,
  ]);

  const createNewLogicalConnection = useCallback(() => {
    const newConnection = getNewAppConnection(
      appState.nodes,
      appState.connections
    );
    if (newConnection !== undefined) {
      addConnection(newConnection);
    }
  }, [addConnection, appState.connections, appState.nodes]);

  return (
    <StyledApp height={windowHeight}>
      <StyledCanvasPlotBorder
        ref={canvasPlotBorderRef}
        onMouseDown={onMouseDownOnCanvasPlotBorder}
        y={appState.panelSizes.canvasHeightFraction}
        width={1 - appState.panelSizes.editorWidthFraction}
        left={0}
      />
      <StyledLeftRightBorder
        ref={leftRightBorderRef}
        onMouseDown={onMouseDownOnLeftRightBorder}
        x={1 - appState.panelSizes.editorWidthFraction}
      />
      <StyledCanvasPlotBorder
        ref={tableControlsBorderRef}
        onMouseDown={onMouseDownOnTableControlsBorder}
        y={appState.panelSizes.tableHeightFraction}
        width={appState.panelSizes.editorWidthFraction}
        left={1 - appState.panelSizes.editorWidthFraction}
      />
      <StyledWorkspace
        height={workspaceHeight}
        width={(1 - appState.panelSizes.editorWidthFraction) * workspaceWidth}
      >
        <StyledCanvas height={canvasHeight}>
          <Canvas
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            devicePixelRatio={ratio}
            draw={draw}
            onMouseDown={onMouseDown}
            handleDoubleClick={handleDoubleClick}
            canvasViewState={appState.canvasViewState}
            setCanvasViewState={setCanvasViewState}
            savedCanvasViewState={appState.savedCanvasState}
            setSavedCanvasViewState={setSavedCanvasState}
            setKeyboardActive={setKeyboardActive}
          />
        </StyledCanvas>
        {plot}
      </StyledWorkspace>
      <Sidebar
        appState={appState}
        setAppState={setAppState}
        height={windowHeight}
        width={editorWidth}
        setTiming={setTiming}
        onAddNode={addNodeInCenterOfCanvas}
        onAddConnection={createNewLogicalConnection}
        updateNodes={(nodes: AppNode[]) => {
          updateNodes(nodes);
          setModelOutput(undefined);
        }}
        deleteNodes={deleteNodes}
        updateConnections={(conns: AppConnection[]) => {
          updateConnections(conns);
          setModelOutput(undefined);
        }}
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
