import { useCallback } from "react";
import { drawConnection, drawNode } from "../components/Canvas/canvasUtils";
import { AppConnection, AppNode } from "../App";

export default function useDraw(
  appNodes: AppNode[],
  appConnections: AppConnection[]
) {
  return useCallback(
    (context: CanvasRenderingContext2D) => {
      appNodes.map((node) => {
        drawNode(
          context,
          node.center,
          node.radius,
          node.isActive,
          node.isBoundary
          // node.temperatureDegC,
          // node.capacitanceJPerDegK
        );
      });

      appConnections.map((conn) => {
        const { source, target } = conn;
        const sourceAppNode = appNodes.find((node) => node.id === source.id);
        const targetAppNode = appNodes.find((node) => node.id === target.id);
        if (sourceAppNode && targetAppNode) {
          drawConnection(context, sourceAppNode, targetAppNode);
        }
      });
    },
    [appConnections, appNodes]
  );
}
