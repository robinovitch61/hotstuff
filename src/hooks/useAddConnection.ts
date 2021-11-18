import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import {
  determineRadius,
  drawArrowWithoutHead,
  intersectsCircle,
  mouseToNodeCoords,
} from "../components/Canvas/canvasUtils";
import { makeConnection } from "hotstuff-network";
import { AppConnection, AppNode } from "../App";
import config from "../config";

const { defaultResistanceDegKPerW, defaultConnectionKind } = config;

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
            node.id !== clickedNode.id &&
            !appConnections.some(
              (conn) =>
                (conn.source.id === node.id &&
                  conn.target.id === clickedNode.id) ||
                (conn.target.id === node.id &&
                  conn.source.id === clickedNode.id)
            )
          );
        });

        if (mouseUpOnNode) {
          const newConnection = {
            ...makeConnection({
              source: clickedNode,
              target: mouseUpOnNode,
              resistanceDegKPerW: defaultResistanceDegKPerW,
              kind: defaultConnectionKind,
            }),
            sourceId: clickedNode.id,
            targetId: mouseUpOnNode.id,
          };
          addConnection(newConnection);
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
