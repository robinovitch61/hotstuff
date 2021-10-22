import React, { useCallback, useRef } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import { addPoints, diffPoints, Point } from "../components/Canvas/pointUtils";

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void,
  clearAndRedraw: (canvasState: CanvasState) => void
): (
  event: React.MouseEvent | MouseEvent,
  clickedNode: AppNode,
  canvasState: CanvasState
) => void {
  const lastMouseRef = useRef<Point | null>(null);
  const clickedNodeCenterRef = useRef<Point | null>(null);

  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      updateNodes([{ ...clickedNode, isActive: true }], true);
      lastMouseRef.current = mouseToNodeCoords(event, canvasState);
      clickedNodeCenterRef.current = clickedNode.center;

      const moveNode = (event: React.MouseEvent | MouseEvent) => {
        if (
          canvasState.context &&
          lastMouseRef.current &&
          clickedNodeCenterRef.current
        ) {
          clearAndRedraw(canvasState);

          const currentMouse = mouseToNodeCoords(event, canvasState);
          const mouseDiff = diffPoints(currentMouse, lastMouseRef.current);
          lastMouseRef.current = currentMouse;
          clickedNodeCenterRef.current = addPoints(
            clickedNodeCenterRef.current,
            mouseDiff
          );

          updateNodes(
            [
              {
                ...clickedNode,
                isActive: true,
                center: clickedNodeCenterRef.current,
              },
            ],
            true
          );
        }
      };
      const mouseUp = () => {
        document.removeEventListener("mousemove", moveNode);
        document.removeEventListener("mouseup", mouseUp);
      };
      document.addEventListener("mousemove", moveNode);
      document.addEventListener("mouseup", mouseUp);
    },
    [clearAndRedraw, updateNodes]
  );
}
