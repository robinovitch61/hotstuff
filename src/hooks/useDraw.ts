import { useCallback } from "react";
import {
  determineColor,
  determineRadius,
  drawConnection,
  drawNode,
} from "../components/Canvas/canvasUtils";
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
      appNodes.forEach((node) => {
        const nodeRadius = determineRadius(
          node.capacitanceJPerDegK,
          appNodes.map((node) => node.capacitanceJPerDegK)
        );
        const nodeColor = determineColor(
          node.temperatureDegC,
          appNodes.map((node) => node.temperatureDegC)
        );
        drawNode(
          context,
          node.name,
          node.center,
          nodeRadius,
          nodeColor,
          node.isActive,
          node.isBoundary,
          node.textDirection
        );
      });

      appConnections.map((conn) => {
        const { source, target, kind } = conn;
        const sourceAppNode = appNodes.find((node) => node.id === source.id);
        const targetAppNode = appNodes.find((node) => node.id === target.id);
        if (sourceAppNode && targetAppNode) {
          const sourceRadius = determineRadius(
            sourceAppNode.capacitanceJPerDegK,
            appNodes.map((node) => node.capacitanceJPerDegK)
          );
          const targetRadius = determineRadius(
            targetAppNode.capacitanceJPerDegK,
            appNodes.map((node) => node.capacitanceJPerDegK)
          );
          drawConnection(
            context,
            sourceAppNode.center,
            sourceRadius,
            targetAppNode.center,
            targetRadius,
            kind
          );
        }
      });
    },
    [appConnections, appNodes]
  );

  const clearAndRedraw = useCallback(
    (canvasState: CanvasState) => {
      if (canvasState.context) {
        canvasState.context.clearRect(
          -canvasState.canvasViewState.offset.x,
          -canvasState.canvasViewState.offset.y,
          canvasState.canvasWidth / canvasState.canvasViewState.scale,
          canvasState.canvasHeight / canvasState.canvasViewState.scale
        );
        draw(canvasState.context);
      }
    },
    [draw]
  );

  return [draw, clearAndRedraw];
}
