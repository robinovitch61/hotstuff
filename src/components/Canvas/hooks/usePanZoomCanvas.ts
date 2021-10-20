import * as React from "react";
import useLast from "./useLast";
import useMousePos from "./useMousePos";
import { diffPoints, ORIGIN, Point, scalePoint } from "../pointUtils";
import config from "../../../config";
import { useCallback, useLayoutEffect, useState } from "react";

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
  (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void
] {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const mousePos = useMousePos(canvasRef);
  const lastMousePos = useLast(mousePos);

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
  const mouseMove = useCallback(() => {
    if (context && lastMousePos.current) {
      const mouseDiff = scalePoint(
        diffPoints(mousePos, lastMousePos.current),
        scale
      );
      setOffset(diffPoints(offset, mouseDiff));
    }
  }, [context, lastMousePos, mousePos, offset, scale]);

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startPan = useCallback(() => {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }, [mouseMove, mouseUp]);

  // add event listener on canvas for zoom
  useLayoutEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (context) {
        const zoom = 1 - event.deltaY / zoomSensitivity;
        const newScale = scale * zoom;
        if (newScale > maxZoom || newScale < minZoom) {
          return;
        }

        // offset the canvas such that the point under the mouse doesn't move
        const lastMouse = scalePoint(mousePos, scale);
        const newMouse = scalePoint(mousePos, newScale);
        const mouseOffset = diffPoints(lastMouse, newMouse);

        setOffset(diffPoints(offset, mouseOffset));
        setScale(newScale);
      }
    }

    canvasElem.addEventListener("wheel", handleWheel);
    return () => canvasElem.removeEventListener("wheel", handleWheel);
  }, [canvasRef, context, mousePos, offset, scale]);

  return [context, setView, offset, scale, startPan];
}
