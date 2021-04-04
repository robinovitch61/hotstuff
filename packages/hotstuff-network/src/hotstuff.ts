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
  timeStep: number;
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
  if (data.timeStep <= 0) {
    throw Error('Timestep must be greater than 0');
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
}

export default function run(data: ModelInputs) {
  validateInputs(data);
  return 1;
}
