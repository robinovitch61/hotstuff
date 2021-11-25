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
        const { firstNode, secondNode, kind } = conn;
        const firstNodeAppNode = appNodes.find(
          (node) => node.id === firstNode.id
        );
        const secondNodeAppNode = appNodes.find(
          (node) => node.id === secondNode.id
        );
        if (firstNodeAppNode && secondNodeAppNode) {
          const firstNodeRadius = determineRadius(
            firstNodeAppNode.capacitanceJPerDegK,
            appNodes.map((node) => node.capacitanceJPerDegK)
          );
          const secondNodeRadius = determineRadius(
            secondNodeAppNode.capacitanceJPerDegK,
            appNodes.map((node) => node.capacitanceJPerDegK)
          );
          drawConnection(
            context,
            firstNodeAppNode.center,
            firstNodeRadius,
            secondNodeAppNode.center,
            secondNodeRadius,
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
