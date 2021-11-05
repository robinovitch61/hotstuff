import { HSConnection, HSNode, ModelOutput, run } from "hotstuff-network";
import React, { useState } from "react";
import styled from "styled-components";
import { ORIGIN, Point } from "./utils/pointUtils";
import Sidebar from "./components/Sidebar/Sidebar";
import Plot from "./components/Plot/Plot";
import config from "./config";
import useWindowSize from "./components/Canvas/hooks/useWindowSize";
import Canvas, { SavedCanvasState } from "./components/Canvas/Canvas";
import useDraw from "./hooks/useDraw";
import useDoubleClick from "./hooks/useDoubleClick";
import useModelUtils from "./hooks/useModelUtils";
import useOnMouseDown from "./hooks/useOnMouseDown";
import useKeyDown from "./hooks/useKeyDown";
import { defaultConnections, defaultNodes } from "./default";
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
  const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
    undefined
  );
  const [timing, setTiming] = useLocalStorageState<Timing>(
    {
      timeStepS: config.defaultTimeStepSeconds,
      totalTimeS: config.defaultTotalTimeSeconds,
    },
    "hotstuffTiming"
  );
  const [appNodes, setAppNodes] = useLocalStorageState<AppNode[]>(
    defaultNodes,
    "hotstuffNodes"
  );
  const [appConnections, setAppConnections] = useLocalStorageState<
    AppConnection[]
  >(defaultConnections, "hotstuffConnections");
  const [
    addNode,
    updateNodes,
    deleteNodes,
    updateConnections,
    deleteConnections,
    setActiveNodes,
    clearActiveNodes,
  ] = useModelUtils(setAppNodes, setAppConnections);

  const [keyboardActive, setKeyboardActive] = useState<boolean>(true);
  useKeyDown(keyboardActive, appNodes, setAppNodes, deleteNodes);

  const [draw, clearAndRedraw] = useDraw(appNodes, appConnections);
  const handleDoubleClick = useDoubleClick(appNodes, addNode, updateNodes);
  const onMouseDown = useOnMouseDown(
    appNodes,
    appConnections,
    setAppConnections,
    updateNodes,
    setActiveNodes,
    clearActiveNodes,
    clearAndRedraw
  );

  const [savedCanvasState, setSavedCanvasState] =
    useLocalStorageState<SavedCanvasState>(
      {
        offset: ORIGIN,
        scale: 1,
      },
      "hotstuffSavedCanvasState"
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
            savedCanvasState={savedCanvasState}
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
          modelOutput={modelOutput}
        />
      </StyledWorkspace>
      <Sidebar
        height={windowHeight}
        width={editorWidth}
        timing={timing}
        setTiming={setTiming}
        nodes={appNodes}
        connections={appConnections}
        // addNode={addNode}
        updateNodes={updateNodes}
        deleteNodes={deleteNodes}
        updateConnections={updateConnections}
        deleteConnections={deleteConnections}
        onRunModel={() => {
          const output = run({
            nodes: appNodes,
            connections: appConnections,
            timeStepS: timing.timeStepS,
            totalTimeS: timing.totalTimeS,
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
