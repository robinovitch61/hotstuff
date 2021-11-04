import * as React from "react";
import { useCallback } from "react";
import { AppConnection, AppNode } from "../App";

export default function useModelUtils(
  setAppNodes: React.Dispatch<React.SetStateAction<AppNode[]>>,
  setAppConnections: React.Dispatch<React.SetStateAction<AppConnection[]>>
): [
  (node: AppNode) => void,
  (nodesToUpdate: AppNode[], clearActiveNodes?: boolean) => void,
  (nodeIds: string[]) => void,
  (connsToUpdate: AppConnection[]) => void,
  (connIds: string[]) => void,
  (activeNodeIds: string[]) => void,
  () => void
] {
  const addNode = useCallback(
    (node: AppNode) => {
      setAppNodes((prevNodes) => {
        const newNodes: AppNode[] = prevNodes.map((node) => ({
          ...node,
          isActive: false,
        }));
        newNodes.push({ ...node, isActive: true });
        return newNodes;
      });
    },
    [setAppNodes]
  );

  const updateNodes = useCallback(
    (nodesToUpdate: AppNode[], clearActiveNodes = false) => {
      setAppNodes((prevNodes) => {
        return prevNodes.map((node) => {
          const nodeToUpdate = nodesToUpdate.find(
            (newNode) => newNode.id === node.id
          );
          if (nodeToUpdate) {
            return nodeToUpdate;
          } else {
            if (clearActiveNodes) {
              return { ...node, isActive: false };
            } else {
              return node;
            }
          }
        });
      });

      setAppConnections((prevConns) => {
        return prevConns.map((prevConn) => {
          const newSourceNode = nodesToUpdate.find(
            (nodeToUpdate) => prevConn.source.id == nodeToUpdate.id
          );
          if (newSourceNode) {
            return {
              ...prevConn,
              source: newSourceNode,
              sourceName: newSourceNode.name,
            };
          }

          const newTargetNode = nodesToUpdate.find(
            (nodeToUpdate) => prevConn.target.id == nodeToUpdate.id
          );
          if (newTargetNode) {
            return {
              ...prevConn,
              target: newTargetNode,
              targetName: newTargetNode.name,
            };
          }

          return prevConn;
        });
      });
    },
    [setAppConnections, setAppNodes]
  );

  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      setAppConnections((prevConns) => {
        return prevConns.filter(
          (conn) =>
            !nodeIds.includes(conn.source.id) &&
            !nodeIds.includes(conn.target.id)
        );
      });
      setAppNodes((prevNodes) =>
        prevNodes.filter((node) => !nodeIds.includes(node.id))
      );
    },
    [setAppConnections, setAppNodes]
  );

  const updateConnections = useCallback(
    (connsToUpdate: AppConnection[]) => {
      const connIdsToUpdate = connsToUpdate.map((conn) => conn.id);
      setAppConnections((prevConns) => {
        const oldConns = prevConns.filter(
          (conn) => !connIdsToUpdate.includes(conn.id)
        );
        return [...connsToUpdate, ...oldConns];
      });
    },
    [setAppConnections]
  );

  const deleteConnections = useCallback(
    (connIds: string[]) => {
      setAppConnections((prevConns) =>
        prevConns.filter((conn) => !connIds.includes(conn.id))
      );
    },
    [setAppConnections]
  );

  const setActiveNodes = useCallback(
    (activeNodeIds: string[]) => {
      setAppNodes((prevNodes) => {
        return prevNodes.map((node) => ({
          ...node,
          isActive: activeNodeIds.includes(node.id),
        }));
      });
    },
    [setAppNodes]
  );

  const clearActiveNodes = useCallback(() => {
    setAppNodes((prevNodes) => {
      return prevNodes.map((node) => ({
        ...node,
        isActive: false,
      }));
    });
  }, [setAppNodes]);

  return [
    addNode,
    updateNodes,
    deleteNodes,
    updateConnections,
    deleteConnections,
    setActiveNodes,
    clearActiveNodes,
  ];
}
