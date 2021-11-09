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
import config from "../config";

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
      mouseDownEvent: React.MouseEvent | MouseEvent,
      canvasState: CanvasState,
      defaultBehavior: (event: React.MouseEvent | MouseEvent) => void
    ) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(mouseDownEvent, canvasState);

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
        if (mouseDownEvent.altKey) {
          makeNewConnection(mouseDownEvent, clickedNode, canvasState);
        } else if (
          mouseDownEvent[config.multiSelectKey] &&
          activeNodeIds.includes(clickedNode.id)
        ) {
          setActiveNodes(activeNodeIds.filter((id) => id !== clickedNode.id));
        } else {
          moveNode(mouseDownEvent, clickedNode, activeNodes, canvasState);
        }
      } else {
        if (mouseDownEvent[config.multiSelectKey]) {
          multiSelect(mouseDownEvent, canvasState);
        } else {
          // only clear active nodes if click with no pan
          const onMouseUp = (mouseUpEvent: React.MouseEvent | MouseEvent) => {
            if (
              mouseUpEvent.clientX === mouseDownEvent.clientX &&
              mouseUpEvent.clientY === mouseDownEvent.clientY
            ) {
              clearActiveNodes();
            }
            document.removeEventListener("mouseup", onMouseUp);
          };
          document.addEventListener("mouseup", onMouseUp);
          defaultBehavior(mouseDownEvent);
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
