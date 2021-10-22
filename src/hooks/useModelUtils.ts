import * as React from "react";
import { useCallback } from "react";
import { AppConnection, AppNode } from "../App";

export default function useModelUtils(
  appNodes: AppNode[],
  setAppNodes: React.Dispatch<React.SetStateAction<AppNode[]>>,
  appConnections: AppConnection[],
  setAppConnections: React.Dispatch<React.SetStateAction<AppConnection[]>>
): [
  (node: AppNode) => void,
  (nodesToUpdate: AppNode[]) => void,
  (nodeIds: string[]) => void,
  (connsToUpdate: AppConnection[]) => void,
  (connIds: string[]) => void,
  (activeNodeIds: string[], keepOtherActiveNodes: boolean) => void,
  () => void
] {
  const addNode = useCallback(
    (node: AppNode) => {
      const newNodes: AppNode[] = appNodes.map((node) => ({
        ...node,
        isActive: false,
      }));
      newNodes.push({ ...node, isActive: true });
      setAppNodes(newNodes);
    },
    [appNodes, setAppNodes]
  );

  const updateNodes = useCallback(
    (nodesToUpdate: AppNode[]) => {
      const nodeIdsToUpdate = nodesToUpdate.map((node) => node.id);
      const newNodes = appNodes.map((node) => {
        if (nodeIdsToUpdate.includes(node.id)) {
          return nodesToUpdate.filter((newNode) => newNode.id === node.id)[0];
        } else {
          return node;
        }
      });
      setAppNodes(newNodes);
    },
    [appNodes, setAppNodes]
  );

  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      const deleteConnectionsForNode = (nodeId: string) => {
        setAppConnections(
          appConnections.filter(
            (conn) => conn.source.id !== nodeId && conn.target.id !== nodeId
          )
        );
      };
      nodeIds.forEach((id) => deleteConnectionsForNode(id));
      setAppNodes(appNodes.filter((node) => !nodeIds.includes(node.id)));
    },
    [appConnections, appNodes, setAppConnections, setAppNodes]
  );

  const updateConnections = useCallback(
    (connsToUpdate: AppConnection[]) => {
      const connIdsToUpdate = connsToUpdate.map((conn) => conn.id);
      const newConns = appConnections.map((conn) => {
        if (connIdsToUpdate.includes(conn.id)) {
          return connsToUpdate.filter((newConn) => newConn.id === conn.id)[0];
        } else {
          return conn;
        }
      });
      setAppConnections(newConns);
    },
    [appConnections, setAppConnections]
  );

  const deleteConnections = useCallback(
    (connIds: string[]) => {
      setAppConnections(
        appConnections.filter((conn) => !connIds.includes(conn.id))
      );
    },
    [appConnections, setAppConnections]
  );

  const updateActiveNodes = useCallback(
    (activeNodeIds: string[], keepOtherActiveNodes: boolean) => {
      setAppNodes(
        appNodes.map((node) => ({
          ...node,
          isActive: activeNodeIds.includes(node.id)
            ? true
            : keepOtherActiveNodes
            ? node.isActive
            : false,
        }))
      );
    },
    [appNodes, setAppNodes]
  );

  const clearActiveNodes = useCallback(() => {
    setAppNodes(
      appNodes.map((node) => ({
        ...node,
        isActive: false,
      }))
    );
  }, [appNodes, setAppNodes]);

  return [
    addNode,
    updateNodes,
    deleteNodes,
    updateConnections,
    deleteConnections,
    updateActiveNodes,
    clearActiveNodes,
  ];
}
