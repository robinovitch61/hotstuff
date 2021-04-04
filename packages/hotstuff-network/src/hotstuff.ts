import { matrixUtils } from './matrixUtils';
import Qty = require('js-quantities');

type Node = {
  id: string;
  name: string;
  temperature: Qty;
  capacitance: Qty;
  powerGen: Qty;
  isBoundary: boolean;
};

type Connection = {
  source: Node;
  target: Node;
  resistance: Qty;
  kind: 'bi' | 'uni' | 'rad';
  heatTransfer: Qty;
};

type Connections = Connection[];

export type ModelInputs = {
  nodes: Node[];
  connections: Connections;
  timeStep: Qty;
  runTime: Qty;
};

export function makeId(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export function toKey(sourceId: string, targetId: string) {
  return `${sourceId}-${targetId}`;
}

export function fromKey(key: string) {
  return key.split('-');
}

export function validateInputs(data: ModelInputs) {
  if (data.timeStep <= Qty('0 s')) {
    throw Error('Timestep must be greater than 0');
  }

  if (data.runTime <= Qty('0 s') || data.runTime < data.timeStep) {
    throw Error('Runtime must be greater than 0 and greater than timestep');
  }

  const uniqueIds = new Set(data.nodes.map((n) => n.id));
  if (uniqueIds.size !== data.nodes.length) {
    throw Error('Not all node ids are unique');
  }

  Array.from(data.connections).forEach((conn) => {
    if (!uniqueIds.has(conn.source.id)) {
      throw Error(`Id ${conn.source.id} does not correspond to a node`);
    }
    if (!uniqueIds.has(conn.target.id)) {
      throw Error(`Id ${conn.target.id} does not correspond to a node`);
    }
  });

  data.nodes.forEach((node) => {
    if (node.temperature < Qty('0 degK')) {
      throw Error(`Impossible temperature of ${node.temperature}`);
    }
    if (node.capacitance < Qty('0 J/degK')) {
      throw Error(`Impossible thermal capacitance of ${node.capacitance}`);
    }
  });

  data.connections.forEach((conn) => {
    if (conn.resistance < Qty('0 degK/W')) {
      throw Error(`Impossible thermal resistance of ${conn.resistance}`);
    }
    if (conn.source.id === conn.target.id) {
      throw Error('Connection source and target are the same');
    }
  });
}

function createAMatrix(data: ModelInputs) {
  const numNodes = data.nodes.length;
}

export default function run(data: ModelInputs) {
  validateInputs(data);
  const A = createAMatrix(data);
  return 1;
}
