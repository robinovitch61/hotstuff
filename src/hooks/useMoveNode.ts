import React, { useCallback, useRef } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import { addPoints, diffPoints } from "../utils/pointUtils";

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void
): (
  event: React.MouseEvent | MouseEvent,
  clickedNode: AppNode,
  activeNodes: AppNode[],
  canvasState: CanvasState
) => void {
  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      activeNodes: AppNode[],
      canvasState: CanvasState
    ) => {
      const offsetMouseToCenter = diffPoints(
        mouseToNodeCoords(event, canvasState),
        clickedNode.center
      );
      const shiftKeyPressed = event.shiftKey;
      const moveNode = (event: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          const newClickedCenter = diffPoints(
            mouseToNodeCoords(event, canvasState),
            offsetMouseToCenter
          );
          updateNodes(
            [
              {
                ...clickedNode,
                isActive: true,
                center: newClickedCenter,
              },
              ...(clickedNode.isActive || shiftKeyPressed
                ? activeNodes.map((node) => {
                    const distanceFromClickedCenter = diffPoints(
                      clickedNode.center,
                      node.center
                    );
                    return {
                      ...node,
                      center: diffPoints(
                        newClickedCenter,
                        distanceFromClickedCenter
                      ),
                    };
                  })
                : []),
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
