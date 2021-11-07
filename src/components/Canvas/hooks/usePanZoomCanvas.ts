import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  addPoints,
  diffPoints,
  ORIGIN,
  Point,
  scalePoint,
} from "../../../utils/pointUtils";
import config from "../../../config";
import { calculateCanvasMouse } from "../canvasUtils";
import { CanvasViewState } from "../Canvas";

const { maxZoom, minZoom, zoomSensitivity } = config;

export default function usePanZoomCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  canvasViewState: CanvasViewState,
  setCanvasViewState: (newCanvasViewState: CanvasViewState) => void
): [
  CanvasRenderingContext2D | null,
  React.Dispatch<React.SetStateAction<CanvasRenderingContext2D | null>>,
  (event: React.MouseEvent | MouseEvent) => void
] {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const mousePosRef = useRef<Point>(ORIGIN);
  const lastMousePosRef = useRef<Point>(ORIGIN);
  const lastCanvasViewState = useRef<CanvasViewState>(canvasViewState);

  // functions for panning
  const mouseMove = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (context) {
        // update mouse position
        const newMousePos = calculateCanvasMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        const mouseDiff = scalePoint(
          diffPoints(mousePosRef.current, lastMousePosRef.current),
          canvasViewState.scale
        );
        const newCanvasViewState = {
          scale: canvasViewState.scale,
          offset: addPoints(lastCanvasViewState.current.offset, mouseDiff),
        };
        setCanvasViewState(newCanvasViewState);
        lastCanvasViewState.current = newCanvasViewState;
      }
    },
    [context, canvasViewState.scale, setCanvasViewState]
  );

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startPan = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (context) {
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
        mousePosRef.current = calculateCanvasMouse(event, context.canvas);
      }
    },
    [context, mouseMove, mouseUp]
  );

  // add event listener on canvas for zoom
  useLayoutEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (context) {
        // update mouse position
        const newMousePos = calculateCanvasMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        // calculate new scale/zoom
        const zoom = 1 - event.deltaY / zoomSensitivity;
        const newScale = canvasViewState.scale * zoom;
        if (newScale > maxZoom || newScale < minZoom) {
          return;
        }

        // offset the canvas such that the point under the mouse doesn't move
        const lastMouse = scalePoint(
          mousePosRef.current,
          canvasViewState.scale
        );
        const newMouse = scalePoint(mousePosRef.current, newScale);
        const mouseOffset = diffPoints(lastMouse, newMouse);

        const newCanvasViewState = {
          offset: diffPoints(lastCanvasViewState.current.offset, mouseOffset),
          scale: newScale,
        };
        setCanvasViewState(newCanvasViewState);
        lastCanvasViewState.current = newCanvasViewState;
      }
    }

    const canvasElem = canvasRef.current;
    if (canvasElem) {
      lastCanvasViewState.current = canvasViewState;
      canvasElem.addEventListener("wheel", handleWheel);
      return () => canvasElem.removeEventListener("wheel", handleWheel);
    }
  }, [canvasRef, canvasViewState, context, setCanvasViewState]);

  return [context, setContext, startPan];
}
