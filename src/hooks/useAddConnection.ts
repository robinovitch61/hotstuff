import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import {
  drawArrow,
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
  setAppConnections: React.Dispatch<React.SetStateAction<AppConnection[]>>,
  clearAndRedraw: (canvasState: CanvasState) => void
) {
  const drawConnectionBeingMade = useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      clickedNode: AppNode,
      canvasState: CanvasState
    ) => {
      if (canvasState.context) {
        const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);
        clearAndRedraw(canvasState);
        drawArrow(
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
        const mouseUpOnNode = appNodes.find(
          (node) =>
            intersectsCircle(nodeCoordsOfMouse, node.center, node.radius) &&
            node.id !== clickedNode.id &&
            !appConnections.some(
              (conn) =>
                (conn.source.id === node.id &&
                  conn.target.id === clickedNode.id) ||
                (conn.target.id === node.id &&
                  conn.source.id === clickedNode.id)
            )
        );

        if (mouseUpOnNode) {
          const newConnection = {
            ...makeConnection({
              source: clickedNode,
              target: mouseUpOnNode,
              resistanceDegKPerW: defaultResistanceDegKPerW,
              kind: defaultConnectionKind,
            }),
            sourceName: clickedNode.name,
            targetName: mouseUpOnNode.name,
          };
          setAppConnections([...appConnections, newConnection]);
        } else {
          clearAndRedraw(canvasState);
        }
      };
      document.addEventListener("mousemove", drawConnWrapper);
      document.addEventListener("mouseup", mouseUp);
    },
    [
      appConnections,
      appNodes,
      clearAndRedraw,
      drawConnectionBeingMade,
      setAppConnections,
    ]
  );
}
