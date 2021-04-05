import { matrixUtils } from './matrixUtils';
import Qty = require('js-quantities');

// TODO: Remove unit conversion stuff, just document units

type NodeParams = {
  name: string;
  temperature: Qty; // degC
  capacitance: Qty; // J/degK
  powerGen: Qty; // W
  isBoundary: boolean;
};

type Node = NodeParams & {
  id: string;
};

export type Connection = {
  source: Node;
  target: Node;
  resistance: Qty; // degK/W
  kind: 'bi' | 'uni' | 'rad';
};

export type ModelInputs = {
  nodes: Node[];
  connections: Connection[];
  timestep: Qty;
  runTime: Qty;
};

export function makeId(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export function makeNode({ name, temperature, capacitance, powerGen, isBoundary }: NodeParams): Node {
  return {
    id: makeId(),
    name,
    temperature,
    capacitance,
    powerGen,
    isBoundary,
  };
}

export function toKey(sourceId: string, targetId: string) {
  return `${sourceId}-${targetId}`;
}

export function fromKey(key: string) {
  return key.split('-');
}

export function validateInputs(data: ModelInputs) {
  if (data.timestep <= Qty('0 s')) {
    throw Error('timestep must be greater than 0');
  }

  if (data.runTime <= Qty('0 s') || data.runTime < data.timestep) {
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

// TODO: Rename?
export function calculateTerm(capacitance: Qty, resistance: Qty): number {
  return 1 / capacitance.to('J/degC').scalar / resistance.to('degK/W').scalar;
}

export function createAMatrix(nodes: Node[], connections: Connection[]) {
  const numNodes = nodes.length;
  const nodeIds = nodes.map((node) => node.id);
  const vals = matrixUtils.zeros2d(numNodes, numNodes);
  const vals4 = matrixUtils.zeros2d(numNodes, numNodes);
  connections.forEach((conn) => {
    nodes.forEach((node, nodeIdx) => {
      if (node.id === conn.source.id || node.id === conn.target.id) {
        const sourceIdx = nodeIds.indexOf(conn.source.id);
        const targetIdx = nodeIds.indexOf(conn.target.id);
        const term = calculateTerm(node.capacitance, conn.resistance);

        if (conn.kind !== 'rad') {
          // if unidirectional, target does not affect source
          if (node.id === conn.source.id && conn.kind !== 'uni') {
            vals[nodeIdx][sourceIdx] -= term;
            vals[nodeIdx][targetIdx] += term;
          } else if (node.id === conn.target.id) {
            vals[nodeIdx][targetIdx] -= term;
            vals[nodeIdx][sourceIdx] += term;
          }
        } else {
          // assume target radiates to ambient and not back to source
          if (node.id == conn.source.id) {
            vals4[nodeIdx][sourceIdx] -= term;
            vals4[nodeIdx][targetIdx] += term;
          }
        }
      }
    });
  });
  return [vals, vals4];
}

export function createBVector(nodes: Node[]): number[][] {
  const flatB = nodes.map((node) => node.powerGen.div(node.capacitance).scalar);
  return matrixUtils.makeVertical(flatB);
}

export function getTemps(nodes: Node[]): number[][] {
  const flatTemps = nodes.map((node) => node.temperature.scalar);
  return matrixUtils.makeVertical(flatTemps);
}

export function numTimesteps(timestep: Qty, runTime: Qty) {
  if (timestep.gt(runTime)) {
    return 0;
  }
  return Math.ceil(runTime.div(timestep).scalar);
}

export function updateTemps(timestep: number, temps: number[][], A: number[][], A4: number[][], B: number[][]) {
  console.log('yay');
}

export default function run(data: ModelInputs) {
  validateInputs(data);
  const [A, A4] = createAMatrix(data.nodes, data.connections);
  // const B = createBVector(data.nodes);
  // const initialTemps = getTemps(data.nodes);
  const steps = numTimesteps(data.timestep, data.runTime);
  Array.from(Array(steps).keys()).forEach((step) => {
    // const output = updateTemps();
  });
}
