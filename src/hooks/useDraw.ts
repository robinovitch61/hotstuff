import { useCallback } from "react";
import { drawConnections, drawNodes } from "../components/Canvas/canvasUtils";
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
      drawConnections(context, appNodes, appConnections);
      drawNodes(context, appNodes);
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
