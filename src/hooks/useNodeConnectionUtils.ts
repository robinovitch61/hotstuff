import { useCallback } from "react";
import { AppConnection, AppNode } from "../App";

export default function useNodeConnectionUtils(
  appNodes: AppNode[],
  setAppNodes: (newNodes: AppNode[]) => void,
  appConnections: AppConnection[],
  setAppConnections: (newConnections: AppConnection[]) => void
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
      const newNodes = appNodes.map((node) => ({
        ...node,
        isActive: false,
      }));
      newNodes.push({ ...node, isActive: true });
      setAppNodes(newNodes);
    },
    [appNodes, setAppNodes]
  );

  const updateNodes = useCallback(
    (nodesToUpdate: AppNode[], clearActiveNodes = false) => {
      const newNodes = appNodes.map((node) => {
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
      setAppNodes(newNodes);

      const newConnections = appConnections.map((prevConn) => {
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
      setAppConnections(newConnections);
    },
    [appConnections, appNodes, setAppConnections, setAppNodes]
  );

  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      const newConnections = appConnections.filter(
        (conn) =>
          !nodeIds.includes(conn.source.id) && !nodeIds.includes(conn.target.id)
      );
      setAppConnections(newConnections);

      const newNodes = appNodes.filter((node) => !nodeIds.includes(node.id));
      setAppNodes(newNodes);
    },
    [appConnections, appNodes, setAppConnections, setAppNodes]
  );

  const updateConnections = useCallback(
    (connsToUpdate: AppConnection[]) => {
      const connIdsToUpdate = connsToUpdate.map((conn) => conn.id);
      const oldConns = appConnections.filter(
        (conn) => !connIdsToUpdate.includes(conn.id)
      );
      setAppConnections([...connsToUpdate, ...oldConns]);
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

  const setActiveNodes = useCallback(
    (activeNodeIds: string[]) => {
      setAppNodes(
        appNodes.map((node) => ({
          ...node,
          isActive: activeNodeIds.includes(node.id),
        }))
      );
    },
    [appNodes, setAppNodes]
  );

  const clearActiveNodes = useCallback(() => {
    const anyActiveNodes = appNodes.find((node) => node.isActive) !== undefined;
    if (anyActiveNodes) {
      setAppNodes(
        appNodes.map((node) => ({
          ...node,
          isActive: false,
        }))
      );
    }
  }, [appNodes, setAppNodes]);

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
