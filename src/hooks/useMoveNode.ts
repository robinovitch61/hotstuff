import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[]) => void,
  clearAndRedraw: (canvasState: CanvasState) => void
) {
  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      clickedNode.isActive = true;
      const moveNode = (event: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          clickedNode.center = mouseToNodeCoords(event, canvasState);
          clearAndRedraw(canvasState);
        }
      };
      const mouseUp = () => {
        document.removeEventListener("mousemove", moveNode);
        document.removeEventListener("mouseup", mouseUp);
        updateNodes([clickedNode]);
      };
      document.addEventListener("mousemove", moveNode);
      document.addEventListener("mouseup", mouseUp);
    },
    [clearAndRedraw, updateNodes]
  );
}
