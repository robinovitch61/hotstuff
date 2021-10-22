import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import { makeNode } from "hotstuff-network";
import { mouseToNodeCoords } from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";
import config from "../config";

const { newNodeNamePrefix, defaultNodeRadius } = config;

export default function useAddNode(
  appNodes: AppNode[],
  addNode: (node: AppNode) => void
) {
  return useCallback(
    (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => {
      if (event.shiftKey || event.altKey) {
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
        temperatureDegC: 0,
        capacitanceJPerDegK: 0,
        powerGenW: 0,
        isBoundary: false,
      });
      const newAppNode = {
        ...newNode,
        center: mouseToNodeCoords(event, canvasState),
        radius: defaultNodeRadius,
        color: "red",
        isActive: false,
      };
      addNode(newAppNode);
    },
    [addNode, appNodes]
  );
}
