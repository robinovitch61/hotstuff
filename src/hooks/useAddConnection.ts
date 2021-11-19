import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import {
  determineRadius,
  drawArrowWithoutHead,
  intersectsCircle,
  mouseToNodeCoords,
} from "../components/Canvas/canvasUtils";
import { AppConnection, AppNode } from "../App";
import { getNewConnection } from "../utils/nodeConnectionUtils";

export default function useAddConnection(
  appNodes: AppNode[],
  appConnections: AppConnection[],
  addConnection: (newConnection: AppConnection) => void,
  clearAndRedraw: (canvasState: CanvasState) => void
): (
  event: React.MouseEvent | MouseEvent,
  clickedNode: AppNode,
  canvasState: CanvasState
) => void {
  const drawConnectionBeingMade = useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      if (canvasState.context) {
        const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);
        clearAndRedraw(canvasState);
        drawArrowWithoutHead(
          canvasState.context,
          clickedNode.center,
          nodeCoordsOfMouse,
          "grey"
        );
      }
    },
    [clearAndRedraw]
  );

  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      const drawConnWrapper = (event: React.MouseEvent | MouseEvent) => {
        drawConnectionBeingMade(event, clickedNode, canvasState);
      };

      const mouseUp = (event: React.MouseEvent | MouseEvent) => {
        document.removeEventListener("mousemove", drawConnWrapper);
        document.removeEventListener("mouseup", mouseUp);

        // if arrow released on a node, make new connection
        const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);
        const mouseUpOnNode = appNodes.find((node) => {
          const nodeRadius = determineRadius(
            node.capacitanceJPerDegK,
            appNodes.map((node) => node.capacitanceJPerDegK)
          );
          return (
            intersectsCircle(nodeCoordsOfMouse, node.center, nodeRadius) &&
            node.id !== clickedNode.id
          );
        });

        if (mouseUpOnNode) {
          const newConnection = getNewConnection(
            clickedNode,
            mouseUpOnNode,
            appConnections
          );
          if (!!newConnection) {
            addConnection(newConnection);
          } else {
            clearAndRedraw(canvasState);
          }
        } else {
          clearAndRedraw(canvasState);
        }
      };
      document.addEventListener("mousemove", drawConnWrapper);
      document.addEventListener("mouseup", mouseUp);
    },
    [
      addConnection,
      appConnections,
      appNodes,
      clearAndRedraw,
      drawConnectionBeingMade,
    ]
  );
}
