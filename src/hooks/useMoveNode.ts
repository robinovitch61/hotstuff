import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void,
  clearAndRedraw: (canvasState: CanvasState) => void
): (
  event: React.MouseEvent | MouseEvent,
  clickedNode: AppNode,
  canvasState: CanvasState
) => void {
  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      const moveNode = (event: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          clearAndRedraw(canvasState);
          updateNodes(
            [
              {
                ...clickedNode,
                isActive: true,
                center: mouseToNodeCoords(event, canvasState),
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
      updateNodes(
        [
          {
            ...clickedNode,
            isActive: true,
          },
        ],
        true
      );
    },
    [clearAndRedraw, updateNodes]
  );
}
