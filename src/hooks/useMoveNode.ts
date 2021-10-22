import React, { useCallback, useRef } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import { diffPoints } from "../components/Canvas/pointUtils";

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void
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
      const offsetMouseToCenter = diffPoints(
        mouseToNodeCoords(event, canvasState),
        clickedNode.center
      );
      const moveNode = (event: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          updateNodes(
            [
              {
                ...clickedNode,
                isActive: true,
                center: diffPoints(
                  mouseToNodeCoords(event, canvasState),
                  offsetMouseToCenter
                ),
              },
            ],
            !event.shiftKey
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
        !event.shiftKey
      );
    },
    [updateNodes]
  );
}
