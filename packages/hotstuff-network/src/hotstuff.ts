import { matrixUtils } from './matrixUtils';

type NodeParams = {
  name: string;
  temperatureDegC: number;
  capacitanceJPerDegK: number;
  powerGenW: number;
  isBoundary: boolean;
};

type Node = NodeParams & {
  id: string;
};

export type Connection = {
  source: Node;
  target: Node;
  resistanceDegKPerW: number;
  kind: 'bi' | 'uni' | 'rad';
};

export type ModelInputs = {
  nodes: Node[];
  connections: Connection[];
  timestepS: number;
  runTimeS: number;
};

export function makeId(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export function makeNode({ name, temperatureDegC, capacitanceJPerDegK, powerGenW, isBoundary }: NodeParams): Node {
  return {
    id: makeId(),
    name,
    temperatureDegC,
    capacitanceJPerDegK,
    powerGenW,
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
  if (data.timestepS <= 0) {
    throw Error('timestepS must be greater than 0');
  }

  if (data.runTimeS <= 0 || data.runTimeS < data.timestepS) {
    throw Error('Runtime must be greater than 0 and greater than timestepS');
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
    if (node.temperatureDegC < 0) {
      throw Error(`Impossible temperatureDegC of ${node.temperatureDegC}`);
    }
    if (node.capacitanceJPerDegK < 0) {
      throw Error(`Impossible thermal capacitanceJPerDegK of ${node.capacitanceJPerDegK}`);
    }
  });

  data.connections.forEach((conn) => {
    if (conn.resistanceDegKPerW < 0) {
      throw Error(`Impossible thermal resistanceDegKPerW of ${conn.resistanceDegKPerW}`);
    }
    if (conn.source.id === conn.target.id) {
      throw Error('Connection source and target are the same');
    }
  });
}

// TODO: Rename?
export function calculateTerm(capacitanceJPerDegK: number, resistanceDegKPerW: number): number {
  return 1 / capacitanceJPerDegK / resistanceDegKPerW;
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
        const term = calculateTerm(node.capacitanceJPerDegK, conn.resistanceDegKPerW);

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
  const flatB = nodes.map((node) => node.powerGenW / node.capacitanceJPerDegK);
  return matrixUtils.makeVertical(flatB);
}

export function getTemps(nodes: Node[]): number[][] {
  const flatTemps = nodes.map((node) => node.temperatureDegC);
  return matrixUtils.makeVertical(flatTemps);
}

export function numTimesteps(timestepS: number, runTimeS: number) {
  if (timestepS > runTimeS) {
    return 0;
  }
  return Math.ceil(runTimeS / timestepS);
}

export function doTimestep(timestepS: number, temps: number[][], A: number[][], A4: number[][], B: number[][]) {
  console.log('yay');
}

export default function run(data: ModelInputs) {
  validateInputs(data);
  const [A, A4] = createAMatrix(data.nodes, data.connections);
  // const B = createBVector(data.nodes);
  // const initialTemps = getTemps(data.nodes);
  const steps = numTimesteps(data.timestepS, data.runTimeS);
  Array.from(Array(steps).keys()).forEach((step) => {
    // const output = doTimestep();
  });
}
