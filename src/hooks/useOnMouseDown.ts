import * as React from "react";
import { useCallback } from "react";
import {
  intersectsCircle,
  mouseToNodeCoords,
} from "../components/Canvas/canvasUtils";
import { AppConnection, AppNode } from "../App";
import { CanvasState } from "../components/Canvas/Canvas";
import useAddConnection from "./useAddConnection";
import useMoveNode from "./useMoveNode";
import useMultiSelect from "./useMultiSelect";

export default function useOnMouseDown(
  appNodes: AppNode[],
  appConnections: AppConnection[],
  setAppConnections: React.Dispatch<React.SetStateAction<AppConnection[]>>,
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void,
  updateActiveNodes: (activeNodeIds: string[]) => void,
  clearActiveNodes: () => void,
  clearAndRedraw: (canvasState: CanvasState) => void
): (
  event: React.MouseEvent | MouseEvent,
  canvasState: CanvasState,
  defaultBehavior: (event: React.MouseEvent | MouseEvent) => void
) => void {
  const makeNewConnection = useAddConnection(
    appNodes,
    appConnections,
    setAppConnections,
    clearAndRedraw
  );
  const moveNode = useMoveNode(updateNodes);
  const multiSelect = useMultiSelect(
    appNodes,
    updateActiveNodes,
    clearAndRedraw
  );

  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      canvasState: CanvasState,
      defaultBehavior: (event: React.MouseEvent | MouseEvent) => void
    ) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const activeNodes = appNodes.filter((node) => node.isActive);
      const activeNodeIds = activeNodes.map((node) => node.id);

      const clickedNode = appNodes.find((node) =>
        intersectsCircle(nodeCoordsOfMouse, node.center, node.radius)
      );

      if (clickedNode) {
        if (event.altKey) {
          makeNewConnection(event, clickedNode, canvasState);
        } else if (event.shiftKey && activeNodeIds.includes(clickedNode.id)) {
          updateActiveNodes(
            activeNodeIds.filter((id) => id !== clickedNode.id)
          );
        } else {
          moveNode(event, clickedNode, activeNodes, canvasState);
        }
      } else {
        if (event.shiftKey) {
          multiSelect(event, canvasState);
        } else {
          clearActiveNodes();
          defaultBehavior(event);
        }
      }
    },
    [
      appNodes,
      clearActiveNodes,
      moveNode,
      multiSelect,
      makeNewConnection,
      updateActiveNodes,
    ]
  );
}
