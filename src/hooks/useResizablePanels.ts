import * as React from "react";
import { useCallback, useRef } from "react";
import useClickAndDragElement from "./useClickAndDragElement";
import { AppState } from "../App";
import config from "../config";

function constrainPanelSize(newPanelSize: number): number {
  return newPanelSize < config.minPanelFraction
    ? config.minPanelFraction
    : newPanelSize > 1 - config.minPanelFraction
    ? 1 - config.minPanelFraction
    : newPanelSize;
}

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
  const constrainX = useCallback(
    (newX: number) => {
      const minPx = windowWidth * config.minPanelFraction;
      const maxPx = windowWidth * (1 - config.minPanelFraction);
      if (newX < minPx) {
        return minPx;
      } else if (newX > maxPx) {
        return maxPx;
      } else {
        return newX;
      }
    },
    [windowWidth]
  );

  const constrainY = useCallback(
    (newY: number) => {
      const minPx = windowHeight * config.minPanelFraction;
      const maxPx = windowHeight * (1 - config.minPanelFraction);
      if (newY < minPx) {
        return minPx;
      } else if (newY > maxPx) {
        return maxPx;
      } else {
        return newY;
      }
    },
    [windowHeight]
  );

  const canvasPlotBorderRef = useRef(null);
  const onDragYCanvasPlot = useCallback(
    (deltaYPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          canvasHeightFraction: constrainPanelSize(
            prevAppState.panelSizes.canvasHeightFraction +
              deltaYPx / windowHeight
          ),
        },
      }));
    },
    [setAppState, windowHeight]
  );
  const onMouseDownOnCanvasPlotBorder = useClickAndDragElement({
    onDragY: onDragYCanvasPlot,
    constrainY,
  });

  const leftRightBorderRef = useRef(null);
  const onDragXLeftRight = useCallback(
    (deltaXPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          editorWidthFraction: constrainPanelSize(
            prevAppState.panelSizes.editorWidthFraction - deltaXPx / windowWidth
          ),
        },
      }));
    },
    [setAppState, windowWidth]
  );
  const onMouseDownOnLeftRightBorder = useClickAndDragElement({
    onDragX: onDragXLeftRight,
    constrainX,
  });

  const tableControlsBorderRef = useRef(null);
  const onDragYTableControls = useCallback(
    (deltaYPx: number) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        panelSizes: {
          ...prevAppState.panelSizes,
          tableHeightFraction: constrainPanelSize(
            prevAppState.panelSizes.tableHeightFraction +
              deltaYPx / windowHeight
          ),
        },
      }));
    },
    [setAppState, windowHeight]
  );
  const onMouseDownOnTableControlsBorder = useClickAndDragElement({
    onDragY: onDragYTableControls,
    constrainY,
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
