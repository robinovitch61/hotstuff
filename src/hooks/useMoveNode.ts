import React, { useCallback, useRef } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import { diffPoints } from "../utils/pointUtils";
import config from "../config";

function getNewAppNodes(
  clickedMouseEvent: React.MouseEvent | MouseEvent,
  currentMouseEvent: React.MouseEvent | MouseEvent,
  canvasState: CanvasState,
  clickedNode: AppNode,
  multiSelectKeyPressed: boolean,
  activeNodes: AppNode[]
): AppNode[] {
  const offsetMouseToCenter = diffPoints(
    mouseToNodeCoords(clickedMouseEvent, canvasState),
    clickedNode.center
  );

  const newClickedCenter = diffPoints(
    mouseToNodeCoords(currentMouseEvent, canvasState),
    offsetMouseToCenter
  );

  const newClickedNode = {
    ...clickedNode,
    isActive: true,
    center: newClickedCenter,
  };

  const newActiveNodes =
    clickedNode.isActive || multiSelectKeyPressed
      ? activeNodes.map((node) => {
          const distanceFromClickedCenter = diffPoints(
            clickedNode.center,
            node.center
          );
          return {
            ...node,
            center: diffPoints(newClickedCenter, distanceFromClickedCenter),
          };
        })
      : [];

  return [newClickedNode, ...newActiveNodes];
}

export default function useMoveNode(
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void
): (
  event: React.MouseEvent | MouseEvent,
  clickedNode: AppNode,
  activeNodes: AppNode[],
  canvasState: CanvasState
) => void {
  const movedRef = useRef<boolean>(false);

  return useCallback(
    (
      mouseDownEvent: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      activeNodes: AppNode[],
      canvasState: CanvasState
    ) => {
      const multiSelectKeyPressed = mouseDownEvent[config.multiSelectKey];
      const moveNode = (currentMouseEvent: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          movedRef.current = true;
          const newNodes = getNewAppNodes(
            mouseDownEvent,
            currentMouseEvent,
            canvasState,
            clickedNode,
            multiSelectKeyPressed,
            activeNodes
          );
          updateNodes(newNodes, !currentMouseEvent[config.multiSelectKey]);
        }
      };
      const mouseUp = (mouseUpEvent: React.MouseEvent | MouseEvent) => {
        document.removeEventListener("mousemove", moveNode);
        document.removeEventListener("mouseup", mouseUp);
        const newNodes = getNewAppNodes(
          mouseDownEvent,
          mouseUpEvent,
          canvasState,
          clickedNode,
          multiSelectKeyPressed,
          activeNodes
        );
        updateNodes(newNodes, !multiSelectKeyPressed);
        movedRef.current = false;
      };
      document.addEventListener("mousemove", moveNode);
      document.addEventListener("mouseup", mouseUp);
    },
    [updateNodes]
  );
}
