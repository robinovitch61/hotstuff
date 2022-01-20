import React, { useEffect } from "react";
import { AppClipboard, AppConnection, AppNode } from "../App";
import { makeConnection, makeNode } from "hotstuff-network";
import { newNodeName } from "../utils/nodeConnectionUtils";
import config from "../config";

export default function useKeyDown(
  keyboardActive: boolean,
  appNodes: AppNode[],
  setAppNodes: (nodes: AppNode[]) => void,
  deleteNodes: (nodeIds: string[]) => void,
  appConnections: AppConnection[],
  setAppConnections: (newConnections: AppConnection[]) => void,
  clipboard: AppClipboard,
  setClipboard: React.Dispatch<React.SetStateAction<AppClipboard>>
): void {
  useEffect(() => {
    const onKeyDown = (event: React.KeyboardEvent | KeyboardEvent) => {
      if (keyboardActive) {
        // meta + A makes all nodes active
        if (event.metaKey && event.keyCode === 65) {
          event.preventDefault();
          setAppNodes(
            appNodes.map((node) => {
              return { ...node, isActive: true };
            })
          );
        }

        // delete active nodes on back/del
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          deleteNodes(
            appNodes.filter((node) => node.isActive).map((node) => node.id)
          );
        }

        // escape key makes all inactive
        if (event.keyCode === 27) {
          setAppNodes(appNodes.map((node) => ({ ...node, isActive: false })));
        }

        // meta + C copies active nodes and associated connections to clipboard
        if (event.metaKey && event.keyCode === 67) {
          event.preventDefault();
          const activeNodes = appNodes.filter((node) => node.isActive);
          const newNodes = activeNodes.map((node) => {
            return {
              // order matters here
              ...node,
              ...makeNode(node),
              center: {
                x: node.center.x + config.pasteXOffset,
                y: node.center.y,
              },
              name: newNodeName(
                appNodes.map((node) => node.name),
                node.name
              ),
            };
          });

          // map active node ids to new nodes
          const activeNodeIdToNewNode = new Map<string, AppNode>();
          for (let i = 0; i < activeNodes.length; i++) {
            activeNodeIdToNewNode.set(activeNodes[i].id, newNodes[i]);
          }

          // map connections involving active nodes to new connections involving new nodes
          // const activeNodeIds = activeNodes.map((node) => node.id);
          const newConnections: AppConnection[] = [];
          appConnections.forEach((conn) => {
            const newFirstNode = activeNodeIdToNewNode.get(conn.firstNode.id);
            const newSecondNode = activeNodeIdToNewNode.get(conn.secondNode.id);
            if (!!newFirstNode && !!newSecondNode) {
              const newConnection = {
                ...conn,
                ...makeConnection({
                  ...conn,
                  firstNode: newFirstNode,
                  secondNode: newSecondNode,
                }),
              };
              newConnections.push(newConnection);
            }
          });

          setClipboard({
            copiedNodes: newNodes,
            copiedConnections: newConnections,
          });
        }

        // meta + V pastes from clipboard
        if (event.metaKey && event.keyCode === 86) {
          event.preventDefault();
          setAppNodes([
            ...appNodes.map((node) => ({ ...node, isActive: false })),
            ...clipboard.copiedNodes,
          ]);
          setAppConnections([
            ...appConnections,
            ...clipboard.copiedConnections,
          ]);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    appConnections,
    appNodes,
    clipboard,
    deleteNodes,
    keyboardActive,
    setAppConnections,
    setAppNodes,
    setClipboard,
  ]);
}
