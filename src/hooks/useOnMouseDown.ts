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
  updateNodes: (nodesToUpdate: AppNode[]) => void,
  updateActiveNodes: (
    activeNodeIds: string[],
    keepOtherActiveNodes: boolean
  ) => void,
  clearActiveNodes: () => void,
  clearAndRedraw: (canvasState: CanvasState) => void
) {
  const makeNewConnection = useAddConnection(
    appNodes,
    appConnections,
    setAppConnections,
    clearAndRedraw
  );
  const moveNode = useMoveNode(updateNodes, clearAndRedraw);
  const multiSelect = useMultiSelect(
    appNodes,
    updateActiveNodes,
    clearAndRedraw
  );

  return useCallback(
    (event, canvasState, defaultBehavior) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const activeNodeIds = appNodes
        .filter((node) => node.isActive)
        .map((node) => node.id);

      const clickedNode = appNodes.find((node) =>
        intersectsCircle(nodeCoordsOfMouse, node.center, node.radius)
      );

      if (clickedNode) {
        if (event.altKey) {
          makeNewConnection(event, clickedNode, canvasState);
        } else if (event.shiftKey && activeNodeIds.includes(clickedNode.id)) {
          updateActiveNodes(
            activeNodeIds.filter((id) => id !== clickedNode.id),
            false
          );
        } else {
          // clicked node without alt key - make active and/or drag node around
          moveNode(event, clickedNode, canvasState);
        }
      } else {
        if (event.shiftKey) {
          multiSelect(event, canvasState);
        } else {
          // clicked on canvas, not a node
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
