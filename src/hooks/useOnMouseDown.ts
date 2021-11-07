import * as React from "react";
import { useCallback } from "react";
import {
  determineRadius,
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
  addConnection: (newConnection: AppConnection) => void,
  updateNodes: (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void,
  setActiveNodes: (activeNodeIds: string[]) => void,
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
    addConnection,
    clearAndRedraw
  );
  const moveNode = useMoveNode(updateNodes);
  const multiSelect = useMultiSelect(appNodes, setActiveNodes, clearAndRedraw);

  return useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      canvasState: CanvasState,
      defaultBehavior: (event: React.MouseEvent | MouseEvent) => void
    ) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const activeNodes = appNodes.filter((node) => node.isActive);
      const activeNodeIds = activeNodes.map((node) => node.id);

      const clickedNode = appNodes.find((node) => {
        const nodeRadius = determineRadius(
          node.capacitanceJPerDegK,
          appNodes.map((node) => node.capacitanceJPerDegK)
        );
        return intersectsCircle(nodeCoordsOfMouse, node.center, nodeRadius);
      });

      if (clickedNode) {
        if (event.altKey) {
          makeNewConnection(event, clickedNode, canvasState);
        } else if (event.shiftKey && activeNodeIds.includes(clickedNode.id)) {
          setActiveNodes(activeNodeIds.filter((id) => id !== clickedNode.id));
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
      setActiveNodes,
    ]
  );
}
