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
import {
  AppConnectionTable,
  ConnectionTableColumn,
} from "../components/Sidebar/EditableTable/ConnectionTable/ConnectionTable";
import { CellOption } from "../components/Sidebar/EditableTable/types";

const { newNodeNamePrefix } = config;

const ALL_CONNECTION_KINDS: HSConnectionKind[] = ["cond", "conv", "rad"];
const DO_NOT_PAIR_KINDS: HSConnectionKind[] = ["cond", "conv"]; // cannot have both of these at once

export function getExistingConnections(
  firstNodeId: string,
  secondNodeId: string,
  connections: HSConnection[]
): HSConnection[] {
  return connections.filter(
    (conn) =>
      (conn.firstNode.id === firstNodeId &&
        conn.secondNode.id === secondNodeId) ||
      (conn.firstNode.id === secondNodeId && conn.secondNode.id === firstNodeId)
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
      firstNode: firstNodeFirst ? firstNode : secondNode,
      secondNode: firstNodeFirst ? secondNode : firstNode,
      resistanceDegKPerW: resistance || config.defaultResistanceDegKPerW,
      kind,
    }),
    firstNodeId: firstNodeFirst ? firstNode.id : secondNode.id,
    secondNodeId: firstNodeFirst ? secondNode.id : firstNode.id,
  };
};

export function getNewConnectionKindsPossible(
  connectionKind: HSConnectionKind,
  firstNodeId: string,
  secondNodeId: string,
  otherConnections: HSConnection[]
): HSConnectionKind[] {
  // if there's another connection between the nodes (either direction) with that same kind:
  // - no option for the same kind of connection
  // - no option for both conduction and convection at once as this doesn't make sense physically (solid vs. fluid)
  const existingConnections = getExistingConnections(
    firstNodeId,
    secondNodeId,
    otherConnections
  );
  const existingKinds = existingConnections.map((conn) => conn.kind);
  if (
    connectionKind === "rad" &&
    DO_NOT_PAIR_KINDS.some((k) => existingKinds.includes(k))
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

  if (DO_NOT_PAIR_KINDS.every((k) => !existingKinds.includes(k))) {
    return makeNewConnection(firstNode, secondNode, "cond");
  } else if (
    DO_NOT_PAIR_KINDS.some((k) => remainingKinds.includes(k)) &&
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

export function validateNodeName(name: string, otherNames: string[]): string {
  const trimName = name.trim();
  const safeName = trimName === "" ? config.defaultNodeName.trim() : trimName;
  const safeAllNames = otherNames.map((n) => n.trim());
  if (safeAllNames.includes(safeName)) {
    let i = 2;
    const makeNewName = (i: number) => `${safeName} [${i}]`;
    while (safeAllNames.includes(makeNewName(i))) {
      i += 1;
    }
    return makeNewName(i);
  } else {
    return safeName;
  }
}

export function getConnectionAfterValue(
  col: ConnectionTableColumn,
  row: AppConnectionTable
): string | undefined {
  return col.key !== "resistanceDegKPerW"
    ? undefined
    : row.kind === "rad"
    ? " [K\u2074/W]"
    : " [K/W]";
}

function filterFirstAndSecondNodeOptions(
  filterKey: "firstNodeId" | "secondNodeId",
  options: CellOption[],
  selectedConnection: AppConnection,
  allOtherConnections: AppConnection[]
) {
  const filteringFirstNode = filterKey === "firstNodeId";

  // the selected connection should not consider its currently selected value or the ability to connect to itself
  const noSelfConnectionOptions = options.filter(
    (option) =>
      option.id !==
        (filteringFirstNode
          ? selectedConnection.firstNode.id
          : selectedConnection.secondNode.id) &&
      option.id !==
        (filteringFirstNode
          ? selectedConnection.secondNode.id
          : selectedConnection.firstNode.id)
  );

  // exclude the options that would create duplicate or illegal connections
  return noSelfConnectionOptions.filter((option) => {
    return !allOtherConnections.some((otherConnection) => {
      const isIllegalConnectionKindCombo =
        (DO_NOT_PAIR_KINDS.includes(selectedConnection.kind) &&
          DO_NOT_PAIR_KINDS.includes(otherConnection.kind)) ||
        selectedConnection.kind === otherConnection.kind;

      if (filteringFirstNode) {
        return (
          (isIllegalConnectionKindCombo &&
            option.id === otherConnection.firstNode.id &&
            selectedConnection.secondNode.id ===
              otherConnection.secondNode.id) ||
          (isIllegalConnectionKindCombo &&
            option.id === otherConnection.secondNode.id &&
            selectedConnection.secondNode.id === otherConnection.firstNode.id)
        );
      } else {
        return (
          (isIllegalConnectionKindCombo &&
            option.id === otherConnection.secondNode.id &&
            selectedConnection.firstNode.id === otherConnection.firstNode.id) ||
          (isIllegalConnectionKindCombo &&
            option.id === otherConnection.firstNode.id &&
            selectedConnection.firstNode.id === otherConnection.secondNode.id)
        );
      }
    });
  });
}

export function filterConnectionOptions(
  colKey: string,
  options: CellOption[],
  selectedConnection: AppConnection,
  connections: AppConnection[]
): CellOption[] {
  const otherConnections = connections.filter(
    (conn) => conn.id !== selectedConnection.id
  );

  if (["firstNodeId", "secondNodeId"].includes(colKey)) {
    return filterFirstAndSecondNodeOptions(
      colKey as "firstNodeId" | "secondNodeId",
      options,
      selectedConnection,
      otherConnections
    );
  } else if (colKey === "kind") {
    if (!!selectedConnection) {
      const possibleKinds = getNewConnectionKindsPossible(
        selectedConnection.kind,
        selectedConnection.firstNode.id,
        selectedConnection.secondNode.id,
        connections
      );
      return options.filter((opt) =>
        possibleKinds.includes(opt.id as HSConnectionKind)
      );
    } else {
      return options;
    }
  } else {
    return options;
  }
}
