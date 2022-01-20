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
    connectionNotes: "",
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

export function newNodeName(allNodeNames: string[], name: string): string {
  function makeName(i: number): string {
    if (i === 1) {
      return name;
    }
    return `${name} [${i}]`;
  }

  let i = 1;
  while (allNodeNames.includes(makeName(i))) {
    i += 1;
  }
  return makeName(i);
}

export function getNewAppNode(appNodes: AppNode[], center: Point): AppNode {
  const allNodeNames = appNodes.map((node) => node.name);

  const newNode = makeNode({
    name: newNodeName(allNodeNames, config.newNodeNamePrefix),
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
    nodeNotes: "",
  };
}

export function validateNodeName(name: string, otherNames: string[]): string {
  const trimName = name.trim();
  const safeName = trimName === "" ? config.defaultNodeName.trim() : trimName;
  const safeAllNames = otherNames.map((n) => n.trim());
  return newNodeName(safeAllNames, safeName);
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

export function getConnectionKey(connection: HSConnection): string {
  return connection.firstNode.id > connection.secondNode.id
    ? `${connection.firstNode.id}-${connection.secondNode.id}`
    : `${connection.secondNode.id}-${connection.firstNode.id}`;
}

export function getConnectionsToCounts(
  connections: HSConnection[]
): Map<string, number> {
  const connectionToCount = new Map();
  connections.forEach((conn) => {
    incrementConnectionCount(connectionToCount, conn);
  });
  return connectionToCount;
}

export function incrementConnectionCount(
  connectionsToCounts: Map<string, number>,
  connection: HSConnection
): void {
  const key = getConnectionKey(connection);
  connectionsToCounts.set(key, (connectionsToCounts.get(key) ?? 0) + 1);
}

export function decrementConnectionCount(
  connectionsToCounts: Map<string, number>,
  connection: HSConnection
): void {
  const key = getConnectionKey(connection);
  const currentCount = connectionsToCounts.get(key) ?? 0;
  if (currentCount > 1) {
    connectionsToCounts.set(key, currentCount - 1);
  }
}
