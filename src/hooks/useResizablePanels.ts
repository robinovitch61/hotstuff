import * as React from "react";
import { useCallback, useRef } from "react";
import useClickAndDragElement from "./useClickAndDragElement";
import { AppState } from "../App";

export default function useResizablePanels(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  windowHeight: number,
  windowWidth: number
): [
  React.MutableRefObject<null>,
  (mouseDownEvent: MouseEvent | React.MouseEvent<Element, MouseEvent>) => void,
  React.MutableRefObject<null>,
  (mouseDownEvent: MouseEvent | React.MouseEvent<Element, MouseEvent>) => void,
  React.MutableRefObject<null>,
  (mouseDownEvent: MouseEvent | React.MouseEvent<Element, MouseEvent>) => void
] {
  const canvasPlotBorderRef = useRef(null);
  const onDragYCanvasPlot = useCallback(
    (deltaYPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          canvasHeightFraction:
            prevAppState.panelSizes.canvasHeightFraction +
            deltaYPx / windowHeight,
        },
      }));
    },
    [setAppState, windowHeight]
  );
  const onMouseDownOnCanvasPlotBorder = useClickAndDragElement({
    onDragY: onDragYCanvasPlot,
  });

  const leftRightBorderRef = useRef(null);
  const onDragXLeftRight = useCallback(
    (deltaXPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          editorWidthFraction:
            prevAppState.panelSizes.editorWidthFraction -
            deltaXPx / windowWidth,
        },
      }));
    },
    [setAppState, windowWidth]
  );
  const onMouseDownOnLeftRightBorder = useClickAndDragElement({
    onDragX: onDragXLeftRight,
  });

  const tableControlsBorderRef = useRef(null);
  const onDragYTableControls = useCallback(
    (deltaYPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          tableHeightFraction:
            prevAppState.panelSizes.tableHeightFraction +
            deltaYPx / windowHeight,
        },
      }));
    },
    [setAppState, windowHeight]
  );
  const onMouseDownOnTableControlsBorder = useClickAndDragElement({
    onDragY: onDragYTableControls,
  });

  return [
    canvasPlotBorderRef,
    onMouseDownOnCanvasPlotBorder,
    leftRightBorderRef,
    onMouseDownOnLeftRightBorder,
    tableControlsBorderRef,
    onMouseDownOnTableControlsBorder,
  ];
}
