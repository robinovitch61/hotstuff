import React, { useCallback } from "react";
import { CanvasState } from "../components/Canvas/Canvas";
import {
  drawClearBox,
  isInsideBox,
  mouseToNodeCoords,
} from "../components/Canvas/canvasUtils";
import { AppNode } from "../App";

export default function useMultiSelect(
  appNodes: AppNode[],
  setActiveNodes: (activeNodeIds: string[]) => void,
  clearAndRedraw: (canvasState: CanvasState) => void
): (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => void {
  return useCallback(
    (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => {
      const boxStart = mouseToNodeCoords(event, canvasState);
      const drawBox = (event: React.MouseEvent | MouseEvent) => {
        if (canvasState.context) {
          clearAndRedraw(canvasState);
          drawClearBox(
            canvasState.context,
            boxStart,
            mouseToNodeCoords(event, canvasState),
            "grey"
          );
        }
      };
      const mouseUp = (event: React.MouseEvent | MouseEvent) => {
        document.removeEventListener("mousemove", drawBox);
        document.removeEventListener("mouseup", mouseUp);

        const boxEnd = mouseToNodeCoords(event, canvasState);
        const activeNodeIds = appNodes
          .filter(
            (node) =>
              isInsideBox(boxStart, boxEnd, node.center) || node.isActive
          )
          .map((node) => node.id);
        setActiveNodes(activeNodeIds);
      };
      document.addEventListener("mousemove", drawBox);
      document.addEventListener("mouseup", mouseUp);
    },
    [appNodes, clearAndRedraw, setActiveNodes]
  );
}
