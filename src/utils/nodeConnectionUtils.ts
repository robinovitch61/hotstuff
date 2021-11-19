import {
  HSConnection,
  HSConnectionKind,
  HSNode,
  makeConnection,
  makeNode,
} from "hotstuff-network";
import config from "../config";
import { AppConnection, AppNode } from "../App";
import { Point } from "./pointUtils";

const { newNodeNamePrefix } = config;

const ALL_CONNECTION_KINDS: HSConnectionKind[] = ["cond", "conv", "rad"];

export function getExistingConnections(
  firstNodeId: string,
  secondNodeId: string,
  connections: HSConnection[]
): HSConnection[] {
  return connections.filter(
    (conn) =>
      (conn.source.id === firstNodeId && conn.target.id === secondNodeId) ||
      (conn.source.id === secondNodeId && conn.target.id === firstNodeId)
  );
}

export const makeNewConnection = (
  firstNode: HSNode,
  secondNode: HSNode,
  kind: HSConnectionKind,
  resistance?: number
): AppConnection => {
  const firstNodeFirst = firstNode.name <= secondNode.name;
  return {
    ...makeConnection({
      source: firstNodeFirst ? firstNode : secondNode,
      target: firstNodeFirst ? secondNode : firstNode,
      resistanceDegKPerW: resistance || config.defaultResistanceDegKPerW,
      kind,
    }),
    sourceId: firstNodeFirst ? firstNode.id : secondNode.id,
    targetId: firstNodeFirst ? secondNode.id : firstNode.id,
  };
};

export function getNewConnectionKindsPossible(
  connectionKind: HSConnectionKind,
  firstNode: HSNode,
  secondNode: HSNode,
  otherConnections: HSConnection[]
): HSConnectionKind[] {
  // if there's another connection between the nodes (either direction) with that same kind:
  // - no option for the same kind of connection
  // - no option for both conduction and convection at once as this doesn't make sense physically (solid vs. fluid)
  const existingConnections = getExistingConnections(
    firstNode.id,
    secondNode.id,
    otherConnections
  );
  const existingKinds = existingConnections.map((conn) => conn.kind);
  if (
    connectionKind === "rad" &&
    (existingKinds.includes("cond") || existingKinds.includes("conv"))
  ) {
    return [];
  } else
    return ALL_CONNECTION_KINDS.filter((kind) => !existingKinds.includes(kind));
}

export function getNewConnection(
  firstNode: AppNode,
  secondNode: AppNode,
  connections: AppConnection[]
): AppConnection | undefined {
  const existingConnections = getExistingConnections(
    firstNode.id,
    secondNode.id,
    connections
  );
  // if no current connections, make a conductive connection
  if (existingConnections.length === 0) {
    return makeNewConnection(firstNode, secondNode, "cond");
  }

  const existingKinds = existingConnections.map((conn) => conn.kind);
  const remainingKinds = ALL_CONNECTION_KINDS.filter(
    (kind) => !existingKinds.includes(kind)
  );

  if (!existingKinds.includes("cond") && !existingKinds.includes("conv")) {
    return makeNewConnection(firstNode, secondNode, "cond");
  } else if (
    (remainingKinds.includes("cond") || remainingKinds.includes("conv")) &&
    !existingKinds.includes("rad")
  ) {
    return makeNewConnection(firstNode, secondNode, "rad");
  }
}

export function getNewPossibleConnection(
  appNodes: AppNode[],
  appConnections: AppConnection[]
): AppConnection | undefined {
  for (const firstNode of appNodes) {
    for (const secondNode of appNodes) {
      if (firstNode.id !== secondNode.id) {
        const newConnection = getNewConnection(
          firstNode,
          secondNode,
          appConnections
        );
        if (!!newConnection) {
          return newConnection;
        }
      }
    }
  }
  return undefined;
}

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
