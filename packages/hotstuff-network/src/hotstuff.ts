import { matrixUtils } from './matrixUtils';

export const KELVIN = 273.15;

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

export type ModelInput = {
  nodes: Node[];
  connections: Connection[];
  timestepS: number;
  runTimeS: number;
};

export type TempOutput = {
  node: Node;
  tempDegC: number[];
};

type HeatTransferOutput = {
  connection: Connection;
  heatTransferW: number[];
};

export type ModelOutput = {
  timeSeriesS: number[];
  timestepS: number;
  runTimeS: number;
  numTimesteps: number;
  temps: TempOutput[];
  heatTransfer: HeatTransferOutput[];
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

export function validateInputs(data: ModelInput) {
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

// TODO: TEST
export function toKelvin(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, KELVIN) as number[];
}

// TODO: TEST
export function toCelcius(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, -KELVIN) as number[];
}

export function getNodeTemps(nodes: Node[]): number[][] {
  const flatTemps = nodes.map((node) => node.temperatureDegC);
  return matrixUtils.makeVertical(toKelvin(flatTemps));
}

// TODO: TEST
export function tempsWithBoundary(nodes: Node[], recentTemps: number[][], newTemps: number[][]) {
  const temps = [...newTemps];
  nodes.map((node, idx) => {
    if (node.isBoundary) {
      temps[idx] = recentTemps[idx];
    }
  });
  return temps;
}

export function getHeatTransfer(temps: number[][], nodes: Node[], connections: Connection[]): number[] {
  const flatTemps = matrixUtils.flatten(temps);
  const nodeIds = nodes.map((n) => n.id);
  return connections.map((conn) => {
    const sourceIdx = nodeIds.indexOf(conn.source.id);
    const targetIdx = nodeIds.indexOf(conn.target.id);
    const sourceTemp = flatTemps[sourceIdx];
    const targetTemp = flatTemps[targetIdx];

    if (conn.kind === 'rad') {
      return (Math.pow(sourceTemp, 4) - Math.pow(targetTemp, 4)) / conn.resistanceDegKPerW;
    } else {
      return (sourceTemp - targetTemp) / conn.resistanceDegKPerW;
    }
  });
}

export function numTimesteps(timestepS: number, runTimeS: number) {
  if (timestepS > runTimeS) {
    return 0;
  }
  return Math.ceil(runTimeS / timestepS);
}

export function getNewTemps(
  timestepS: number,
  temps: number[][],
  A: number[][],
  A4: number[][],
  B: number[][],
): number[][] {
  const temps4 = matrixUtils.pow(temps, 4);
  const aMult = matrixUtils.mult(A, temps);
  const a4Mult = matrixUtils.mult(A4, temps4);
  const sum = matrixUtils.add(aMult, matrixUtils.add(a4Mult, B));
  const deltaT = matrixUtils.multScalar(sum, timestepS);
  const result = matrixUtils.add(temps, deltaT);
  return result as number[][];
}

export function shapeOutput(
  data: ModelInput,
  timeSeriesS: number[],
  outputTemps: number[][][],
  outputHeatTransfer: number[][],
): ModelOutput {
  const flatTemps = outputTemps.map((temp) => toCelcius(matrixUtils.flatten(temp)));

  const temps = data.nodes.map((node, idx) => {
    return {
      node,
      tempDegC: flatTemps.map((temp) => temp[idx]),
    };
  });

  const heatTransfer = data.connections.map((connection, idx) => {
    return {
      connection,
      heatTransferW: outputHeatTransfer.map((ht) => ht[idx]),
    };
  });

  return {
    timeSeriesS,
    timestepS: timeSeriesS[1],
    runTimeS: timeSeriesS[timeSeriesS.length - 1],
    numTimesteps: timeSeriesS.length,
    temps,
    heatTransfer,
  };
}

export function run(data: ModelInput): ModelOutput {
  validateInputs(data);
  const [A, A4] = createAMatrix(data.nodes, data.connections);
  const B = createBVector(data.nodes);
  const initialTemps = getNodeTemps(data.nodes);
  const initialHeatTransfer = getHeatTransfer(initialTemps, data.nodes, data.connections);
  const numSteps = numTimesteps(data.timestepS, data.runTimeS);
  const outputTemps = [initialTemps];
  const outputHeatTransfer = [initialHeatTransfer];
  const timeStepRange = Array.from(Array(numSteps).keys());
  const timeSeriesS = timeStepRange.map((t) => t * data.timestepS);

  // account for time 0 being input vals
  timeSeriesS.push(timeSeriesS[timeSeriesS.length - 1] + data.timestepS);

  timeStepRange.forEach((step) => {
    const mostRecentTemps = outputTemps[step];
    const newTemps = getNewTemps(data.timestepS, mostRecentTemps, A, A4, B);
    const adjustedTemps = tempsWithBoundary(data.nodes, mostRecentTemps, newTemps);
    const newHeatTransfer = getHeatTransfer(adjustedTemps, data.nodes, data.connections);
    outputTemps.push(adjustedTemps);
    outputHeatTransfer.push(newHeatTransfer);
  });

  return shapeOutput(data, timeSeriesS, outputTemps, outputHeatTransfer);
}
