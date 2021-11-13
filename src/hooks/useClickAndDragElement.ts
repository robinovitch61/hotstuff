import * as React from "react";
import { useRef } from "react";
import { diffPoints, Point } from "../utils/pointUtils";

export default function useClickAndDragElement(params: {
  onDragX?: (deltaXPx: number) => void;
  onDragY?: (deltaYPx: number) => void;
  constrainX?: (newYPx: number) => number;
  constrainY?: (newYPx: number) => number;
}): (mouseDownEvent: React.MouseEvent | MouseEvent) => void {
  const lastMousePos = useRef<Point | undefined>(undefined);

  const { onDragX, onDragY, constrainX, constrainY } = params;

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (mouseMoveEvent: React.MouseEvent | MouseEvent) => {
    if (lastMousePos.current) {
      const currentMousePos = {
        x: mouseMoveEvent.pageX,
        y: mouseMoveEvent.pageY,
      };
      const diff = diffPoints(currentMousePos, lastMousePos.current);
      onDragX && onDragX(diff.x);
      onDragY && onDragY(diff.y);
      lastMousePos.current = {
        x: constrainX ? constrainX(currentMousePos.x) : currentMousePos.x,
        y: constrainY ? constrainY(currentMousePos.y) : currentMousePos.y,
      };
    }
  };

  return (mouseDownEvent: React.MouseEvent | MouseEvent) => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    lastMousePos.current = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };
  };
}
