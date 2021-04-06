import { matrixUtils } from './matrixUtils';
import {
  CircularConnectionError,
  NodeIdValidationError,
  NodeNotFoundError,
  TotalTimeValidationError,
  TemperatureValidationError,
  ThermalCapacitanceValidationError,
  ThermalResistanceValidationError,
  TimeStepValidationError,
} from './errors';

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

export type ConnectionParams = {
  source: Node;
  target: Node;
  resistanceDegKPerW: number;
  kind: 'bi' | 'uni' | 'rad';
};

type Connection = ConnectionParams & {
  id: string;
};

export type ModelInput = {
  nodes: Node[];
  connections: Connection[];
  timeStepS: number;
  totalTimeS: number;
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
  timeStepS: number;
  totalTimeS: number;
  numTimeSteps: number;
  temps: TempOutput[];
  heatTransfer: HeatTransferOutput[];
  errors?: Error[];
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

export function makeConnection({ source, target, resistanceDegKPerW, kind }: ConnectionParams): Connection {
  return {
    id: makeId(),
    source,
    target,
    resistanceDegKPerW,
    kind,
  };
}

export function toKey(sourceId: string, targetId: string) {
  return `${sourceId}-${targetId}`;
}

export function fromKey(key: string) {
  return key.split('-');
}

export function validateInputs(data: ModelInput): Error[] {
  const errors = [];

  if (data.timeStepS <= 0) {
    errors.push(new TimeStepValidationError('TimeStep must be greater than 0 seconds'));
  }

  if (data.totalTimeS <= 0 || data.totalTimeS < data.timeStepS) {
    errors.push(new TotalTimeValidationError('Total time must be greater than 0 and greater than timeStep'));
  }

  const uniqueIds = new Set(data.nodes.map((n) => n.id));
  if (uniqueIds.size !== data.nodes.length) {
    errors.push(new NodeIdValidationError('Not all node ids are unique'));
  }

  Array.from(data.connections).forEach((conn) => {
    if (!uniqueIds.has(conn.source.id)) {
      errors.push(new NodeNotFoundError(`Id ${conn.source.id} does not correspond to a node`));
    }
    if (!uniqueIds.has(conn.target.id)) {
      errors.push(new NodeNotFoundError(`Id ${conn.target.id} does not correspond to a node`));
    }
  });

  data.nodes.forEach((node) => {
    if (node.temperatureDegC < -KELVIN) {
      errors.push(new TemperatureValidationError(`Impossible temperature of ${node.temperatureDegC} degC`));
    }
    if (node.capacitanceJPerDegK < 0) {
      errors.push(
        new ThermalCapacitanceValidationError(`Impossible thermal capacitance of ${node.capacitanceJPerDegK} J/degK`),
      );
    }
  });

  data.connections.forEach((conn) => {
    if (conn.resistanceDegKPerW < 0) {
      errors.push(
        new ThermalResistanceValidationError(`Impossible thermal resistance of ${conn.resistanceDegKPerW} degK/W`),
      );
    }
    if (conn.source.id === conn.target.id) {
      errors.push(new CircularConnectionError('Connection source and target are the same'));
    }
  });

  return errors;
}

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

export function createBVector(nodes: Node[]): number[] {
  return nodes.map((node) => node.powerGenW / node.capacitanceJPerDegK);
}

export function toKelvin(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, KELVIN) as number[];
}

export function toCelcius(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, -KELVIN) as number[];
}

export function getNodeTempsDegK(nodes: Node[]): number[] {
  return toKelvin(nodes.map((node) => node.temperatureDegC));
}

export function tempsWithBoundary(nodes: Node[], recentTemps: number[], newTemps: number[]): number[] {
  return newTemps.map((temp, idx) => {
    if (nodes[idx].isBoundary) {
      return recentTemps[idx];
    } else {
      return temp;
    }
  });
}

export function getHeatTransfer(temps: number[], nodes: Node[], connections: Connection[]): number[] {
  // const flatTemps = matrixUtils.flatten(temps);
  const nodeIds = nodes.map((n) => n.id);
  return connections.map((conn) => {
    const sourceIdx = nodeIds.indexOf(conn.source.id);
    const targetIdx = nodeIds.indexOf(conn.target.id);
    const sourceTemp = temps[sourceIdx];
    const targetTemp = temps[targetIdx];

    if (conn.kind === 'rad') {
      return (Math.pow(sourceTemp, 4) - Math.pow(targetTemp, 4)) / conn.resistanceDegKPerW;
    } else {
      return (sourceTemp - targetTemp) / conn.resistanceDegKPerW;
    }
  });
}

export function numTimeSteps(timeStepS: number, totalTimeS: number) {
  if (timeStepS > totalTimeS) {
    return 0;
  }
  return Math.ceil(totalTimeS / timeStepS);
}

export function calculateNewTemps(
  timeStepS: number,
  temps: number[],
  A: number[][],
  A4: number[][],
  B: number[],
): number[] {
  const temps4 = matrixUtils.pow(temps, 4);
  const aMult = matrixUtils.mult(A, temps);
  const a4Mult = matrixUtils.mult(A4, temps4);
  const sum = matrixUtils.add(aMult, matrixUtils.add(a4Mult, B));
  const deltaT = matrixUtils.multScalar(sum, timeStepS);
  const result = matrixUtils.add(temps, deltaT);
  return result;
}

export function shapeOutput(
  data: ModelInput,
  timeSeriesS: number[],
  outputTemps: number[][],
  outputHeatTransfer: number[][],
): ModelOutput {
  const flatTemps = outputTemps.map((temp) => toCelcius(temp));

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
    timeStepS: timeSeriesS[1],
    totalTimeS: timeSeriesS[timeSeriesS.length - 1],
    numTimeSteps: timeSeriesS.length,
    temps,
    heatTransfer,
  };
}

export const emptyOutput = {
  timeSeriesS: [],
  timeStepS: 0,
  totalTimeS: 0,
  numTimeSteps: 0,
  temps: [],
  heatTransfer: [],
};

export default function run(data: ModelInput): ModelOutput {
  const errors = validateInputs(data);
  if (errors.length > 0) {
    return { ...emptyOutput, errors };
  }
  const [A, A4] = createAMatrix(data.nodes, data.connections);
  const B = createBVector(data.nodes);
  const initialTemps = getNodeTempsDegK(data.nodes);
  const initialHeatTransfer = getHeatTransfer(initialTemps, data.nodes, data.connections);
  const numSteps = numTimeSteps(data.timeStepS, data.totalTimeS);
  const outputTemps = [initialTemps];
  const outputHeatTransfer = [initialHeatTransfer];
  const timeStepRange = Array.from(Array(numSteps).keys());
  const timeSeriesS = timeStepRange.map((t) => t * data.timeStepS);

  // account for time 0 being input vals
  timeSeriesS.push(timeSeriesS[timeSeriesS.length - 1] + data.timeStepS);

  timeStepRange.forEach((step) => {
    const mostRecentTemps = outputTemps[step];
    const newTemps = calculateNewTemps(data.timeStepS, mostRecentTemps, A, A4, B);
    const adjustedTemps = tempsWithBoundary(data.nodes, mostRecentTemps, newTemps);
    const newHeatTransfer = getHeatTransfer(adjustedTemps, data.nodes, data.connections);
    outputTemps.push(adjustedTemps);
    outputHeatTransfer.push(newHeatTransfer);
  });

  return shapeOutput(data, timeSeriesS, outputTemps, outputHeatTransfer);
}
