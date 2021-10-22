import { useCallback } from "react";
import { drawConnection, drawNode } from "../components/Canvas/canvasUtils";
import { AppConnection, AppNode } from "../App";
import { CanvasState } from "../components/Canvas/Canvas";

export default function useDraw(
  appNodes: AppNode[],
  appConnections: AppConnection[]
): [
  (context: CanvasRenderingContext2D) => void,
  (canvasState: CanvasState) => void
] {
  const draw = useCallback(
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

  const clearAndRedraw = useCallback(
    (canvasState: CanvasState) => {
      if (canvasState.context) {
        canvasState.context.clearRect(
          -canvasState.offset.x,
          -canvasState.offset.y,
          canvasState.canvasWidth / canvasState.scale,
          canvasState.canvasHeight / canvasState.scale
        );
        draw(canvasState.context);
      }
    },
    [draw]
  );

  return [draw, clearAndRedraw];
}
