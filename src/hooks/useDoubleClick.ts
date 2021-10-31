import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { makeNode } from "hotstuff-network";
import {
  intersectsCircle,
  mouseToNodeCoords,
  rotatedDirection,
} from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import config from "../config";

const { newNodeNamePrefix, defaultNodeRadius } = config;

export default function useDoubleClick(
  appNodes: AppNode[],
  addNode: (node: AppNode) => void,
  updateNodes: (nodes: AppNode[]) => void
): (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => void {
  return useCallback(
    (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => {
      event.preventDefault();

      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const doubleClickedNode = appNodes.find((node) =>
        intersectsCircle(nodeCoordsOfMouse, node.center, node.radius)
      );
      if (doubleClickedNode) {
        updateNodes([
          {
            ...doubleClickedNode,
            textDirection: rotatedDirection(doubleClickedNode.textDirection),
          },
        ]);
        return;
      }

      const numNewNodes = appNodes.filter((node) =>
        node.name.startsWith(newNodeNamePrefix)
      ).length;

      const newNode = makeNode({
        name:
          numNewNodes === 0
            ? `${newNodeNamePrefix}`
            : `${newNodeNamePrefix} (${numNewNodes + 1})`,
        temperatureDegC: config.defaultTempDegC,
        capacitanceJPerDegK: config.defaultCapJPerDegK,
        powerGenW: config.defaultPowerGenW,
        isBoundary: false,
      });

      const newAppNode: AppNode = {
        ...newNode,
        center: nodeCoordsOfMouse,
        radius: defaultNodeRadius,
        color: "red",
        isActive: false,
        textDirection: "D",
      };
      addNode(newAppNode);
    },
    [addNode, appNodes, updateNodes]
  );
}
