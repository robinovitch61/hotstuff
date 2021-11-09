import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import {
  determineRadius,
  intersectsCircle,
  mouseToNodeCoords,
  rotatedDirection,
} from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import { getNewAppNode } from "../utils/nodeConnectionUtils";
import config from "../config";

export default function useDoubleClick(
  appNodes: AppNode[],
  addNode: (node: AppNode) => void,
  updateNodes: (nodes: AppNode[]) => void
): (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => void {
  return useCallback(
    (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => {
      event.preventDefault();
      if (event[config.multiSelectKey]) {
        return;
      }

      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const doubleClickedNode = appNodes.find((node) => {
        const nodeRadius = determineRadius(
          node.capacitanceJPerDegK,
          appNodes.map((node) => node.capacitanceJPerDegK)
        );
        return intersectsCircle(nodeCoordsOfMouse, node.center, nodeRadius);
      });

      if (doubleClickedNode) {
        updateNodes([
          {
            ...doubleClickedNode,
            textDirection: rotatedDirection(doubleClickedNode.textDirection),
          },
        ]);
      } else {
        const newAppNode = getNewAppNode(appNodes, nodeCoordsOfMouse);
        addNode(newAppNode);
      }
    },
    [addNode, appNodes, updateNodes]
  );
}
