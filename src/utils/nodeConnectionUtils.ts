import { HSConnection, makeConnection, makeNode } from "hotstuff-network";
import config from "../config";
import { AppConnection, AppNode } from "../App";
import { Point } from "./pointUtils";

const { newNodeNamePrefix } = config;

export function getNewAppNode(appNodes: AppNode[], center: Point): AppNode {
  const numNodesWithDefaultPrefix = appNodes.filter((node) =>
    node.name.startsWith(newNodeNamePrefix)
  ).length;

  const newNode = makeNode({
    name:
      numNodesWithDefaultPrefix === 0
        ? `${newNodeNamePrefix}`
        : `${newNodeNamePrefix} (${numNodesWithDefaultPrefix + 1})`,
    temperatureDegC: config.defaultTempDegC,
    capacitanceJPerDegK: config.defaultCapJPerDegK,
    powerGenW: config.defaultPowerGenW,
    isBoundary: false,
  });

  return {
    ...newNode,
    center: center,
    isActive: false,
    textDirection: "D",
  };
}

export function getNewAppConnection(
  appNodes: AppNode[],
  appConnections: AppConnection[]
): AppConnection | undefined {
  console.log("HI");
  if (appNodes.length < 2) {
    console.log("HI2");
    return;
  }
  let found: AppConnection | undefined = undefined;

  appNodes.forEach((firstNode) => {
    appNodes.forEach((secondNode) => {
      if (!found && firstNode.id !== secondNode.id) {
        const connectionForwardsExists = appConnections.find(
          (conn) =>
            conn.source.id === firstNode.id && conn.target.id === secondNode.id
        );
        if (!connectionForwardsExists) {
          const newConnection: HSConnection = makeConnection({
            source: firstNode,
            target: secondNode,
            resistanceDegKPerW: config.defaultResistanceDegKPerW,
            kind: "bi",
          });

          found = {
            ...newConnection,
            sourceName: firstNode.name,
            targetName: secondNode.name,
          };
        }

        const connectionBackwardsExists = appConnections.find(
          (conn) =>
            conn.source.id === secondNode.id && conn.target.id === firstNode.id
        );
        if (!connectionBackwardsExists) {
          const newConnection: HSConnection = makeConnection({
            source: secondNode,
            target: firstNode,
            resistanceDegKPerW: config.defaultResistanceDegKPerW,
            kind: "bi",
          });

          found = {
            ...newConnection,
            sourceName: secondNode.name,
            targetName: firstNode.name,
          };
        }
      }
    });
  });
  return found;
}
