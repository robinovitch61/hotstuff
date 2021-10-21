import * as React from "react";
import {
  addPoints,
  diffPoints,
  ORIGIN,
  Point,
  scalePoint,
} from "../pointUtils";
import config from "../../../config";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { calculateMouse } from "../canvasUtils";

const { maxZoom, minZoom, zoomSensitivity } = config;

export default function usePanZoomCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>
): [
  CanvasRenderingContext2D | null,
  (
    context: CanvasRenderingContext2D | null,
    offset: Point,
    scale: number
  ) => void,
  Point,
  number,
  (event: React.MouseEvent | MouseEvent) => void
] {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const mousePosRef = useRef<Point>(ORIGIN);
  const lastMousePosRef = useRef<Point>(ORIGIN);

  // set view
  const setView = useCallback(
    (
      context: CanvasRenderingContext2D | null,
      offset: Point,
      scale: number
    ) => {
      if (context) {
        // reset state and refs
        setContext(context);
        setOffset(offset);
        setScale(scale);
      }
    },
    []
  );

  // functions for panning
  const mouseMove = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (context) {
        // update mouse position
        const newMousePos = calculateMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        const mouseDiff = scalePoint(
          diffPoints(mousePosRef.current, lastMousePosRef.current),
          scale
        );
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
      }
    },
    [context, scale]
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
        mousePosRef.current = calculateMouse(event, context.canvas);
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
        const newMousePos = calculateMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        // calculate new scale/zoom
        const zoom = 1 - event.deltaY / zoomSensitivity;
        const newScale = scale * zoom;
        if (newScale > maxZoom || newScale < minZoom) {
          return;
        }

        // offset the canvas such that the point under the mouse doesn't move
        const lastMouse = scalePoint(mousePosRef.current, scale);
        const newMouse = scalePoint(mousePosRef.current, newScale);
        const mouseOffset = diffPoints(lastMouse, newMouse);

        setOffset(diffPoints(offset, mouseOffset));
        setScale(newScale);
      }
    }

    const canvasElem = canvasRef.current;
    if (canvasElem) {
      canvasElem.addEventListener("wheel", handleWheel);
      return () => canvasElem.removeEventListener("wheel", handleWheel);
    }
  }, [canvasRef, context, offset, scale]);

  return [context, setView, offset, scale, startPan];
}
