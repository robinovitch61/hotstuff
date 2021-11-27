import { matrixUtils } from './matrixUtils';
import {
  CircularConnectionError,
  DuplicateConnectionError,
  HotStuffError,
  ImpossibleConnectionSetError,
  NodeIdValidationError,
  NodeNotFoundError,
  TemperatureValidationError,
  ThermalCapacitanceValidationError,
  ThermalResistanceValidationError,
  TimeStepValidationError,
  TotalTimeValidationError,
} from './errors';

export const KELVIN = 273.15;

export type HSNodeParams = {
  name: string;
  temperatureDegC: number;
  capacitanceJPerDegK: number;
  powerGenW: number;
  isBoundary: boolean;
};

export type HSNode = HSNodeParams & {
  id: string;
};

export type HSConnectionKind = 'cond' | 'conv' | 'rad';

export type HSConnectionParams = {
  firstNode: HSNode;
  secondNode: HSNode;
  resistanceDegKPerW: number;
  kind: HSConnectionKind;
};

export type HSConnection = HSConnectionParams & {
  id: string;
};

export type ModelInput = {
  nodes: HSNode[];
  connections: HSConnection[];
  timeStepS: number;
  totalTimeS: number;
};

export type NodeResult = {
  node: HSNode;
  tempDegC: number[];
};

export type ConnectionResult = {
  connection: HSConnection;
  heatTransferW: number[];
};

export type ErrorRepresentation = {
  name: string;
  message: string;
};

export type ModelOutput = {
  timeSeriesS: number[];
  timeStepS: number;
  totalTimeS: number;
  numTimeSteps: number;
  nodeResults: NodeResult[];
  connectionResults: ConnectionResult[];
  computeTimeS: number;
  errors?: ErrorRepresentation[];
};

export function makeId(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export function makeNode({ name, temperatureDegC, capacitanceJPerDegK, powerGenW, isBoundary }: HSNodeParams): HSNode {
  return {
    id: makeId(),
    name,
    temperatureDegC,
    capacitanceJPerDegK,
    powerGenW,
    isBoundary,
  };
}

export function makeConnection({ firstNode, secondNode, resistanceDegKPerW, kind }: HSConnectionParams): HSConnection {
  return {
    id: makeId(),
    firstNode: firstNode,
    secondNode: secondNode,
    resistanceDegKPerW,
    kind,
  };
}

export function toKey(firstNodeId: string, secondNodeId: string): string {
  return `${firstNodeId}-${secondNodeId}`;
}

export function fromKey(key: string): string[] {
  return key.split('-');
}

export function validateInputs(data: ModelInput): HotStuffError[] {
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
    if (!uniqueIds.has(conn.firstNode.id)) {
      errors.push(new NodeNotFoundError(`Id ${conn.firstNode.id} does not correspond to a node`));
    }

    if (!uniqueIds.has(conn.secondNode.id)) {
      errors.push(new NodeNotFoundError(`Id ${conn.secondNode.id} does not correspond to a node`));
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
    if (conn.firstNode.id === conn.secondNode.id) {
      errors.push(new CircularConnectionError('Connection firstNode and secondNode are the same'));
    }
  });

  const connections = new Set();
  data.connections.some((conn) => {
    const forward = `${conn.firstNode.id}${conn.secondNode.id}${conn.kind}`;
    const backward = `${conn.secondNode.id}${conn.firstNode.id}${conn.kind}`;
    if (connections.has(forward) || connections.has(backward)) {
      errors.push(
        new DuplicateConnectionError(
          `Connection ${conn.firstNode.name} to ${conn.secondNode.name} of kind ${conn.kind} is duplicated`,
        ),
      );
      return true;
    }
    connections.add(forward);
    connections.add(backward);
  });

  const separator = '|$_$|';
  const connectedPairs = new Set(
    data.connections.map((conn) => `${conn.firstNode.id}${separator}${conn.secondNode.id}`),
  );
  connectedPairs.forEach((pair) => {
    const splitPair = pair.split(separator);
    const kindsInPair = data.connections
      .filter(
        (conn) =>
          (conn.firstNode.id === splitPair[0] && conn.secondNode.id === splitPair[1]) ||
          (conn.firstNode.id === splitPair[1] && conn.secondNode.id === splitPair[0]),
      )
      .map((conn) => conn.kind);
    if (kindsInPair.includes('cond') && kindsInPair.includes('conv')) {
      errors.push(
        new ImpossibleConnectionSetError(
          `Impossible simultaneous existence of conduction and convection between same node`,
        ),
      );
    }
  });

  return errors;
}

export function calculateTerm(capacitanceJPerDegK: number, resistanceDegKPerW: number): number {
  return 1 / capacitanceJPerDegK / resistanceDegKPerW;
}

export function createAMatrix(nodes: HSNode[], connections: HSConnection[]): number[][][] {
  const numNodes = nodes.length;
  const nodeIds = nodes.map((node) => node.id);
  const vals = matrixUtils.zeros2d(numNodes, numNodes);
  const vals4 = matrixUtils.zeros2d(numNodes, numNodes);
  connections.forEach((conn) => {
    nodes.forEach((node, nodeIdx) => {
      if (node.id === conn.firstNode.id || node.id === conn.secondNode.id) {
        const firstNodeIdx = nodeIds.indexOf(conn.firstNode.id);
        const secondNodeIdx = nodeIds.indexOf(conn.secondNode.id);
        const term = calculateTerm(node.capacitanceJPerDegK, conn.resistanceDegKPerW);
        const vals_to_use = conn.kind === 'rad' ? vals4 : vals;
        if (node.id === conn.firstNode.id) {
          vals_to_use[nodeIdx][firstNodeIdx] -= term;
          vals_to_use[nodeIdx][secondNodeIdx] += term;
        } else if (node.id === conn.secondNode.id) {
          vals_to_use[nodeIdx][secondNodeIdx] -= term;
          vals_to_use[nodeIdx][firstNodeIdx] += term;
        }
      }
    });
  });
  return [vals, vals4];
}

export function createBVector(nodes: HSNode[]): number[] {
  return nodes.map((node) => node.powerGenW / node.capacitanceJPerDegK);
}

export function toKelvin(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, KELVIN) as number[];
}

export function toCelcius(temps: number[]): number[] {
  return matrixUtils.addScalar(temps, -KELVIN) as number[];
}

export function getNodeTempsDegK(nodes: HSNode[]): number[] {
  return toKelvin(nodes.map((node) => node.temperatureDegC));
}

export function tempsWithBoundary(nodes: HSNode[], recentTemps: number[], newTemps: number[]): number[] {
  return newTemps.map((temp, idx) => {
    if (nodes[idx].isBoundary) {
      return recentTemps[idx];
    } else {
      return temp;
    }
  });
}

export function getHeatTransfer(temps: number[], nodes: HSNode[], connections: HSConnection[]): number[] {
  // const flatTemps = matrixUtils.flatten(temps);
  const nodeIds = nodes.map((n) => n.id);
  return connections.map((conn) => {
    const firstNodeIdx = nodeIds.indexOf(conn.firstNode.id);
    const secondNodeIdx = nodeIds.indexOf(conn.secondNode.id);
    const firstNodeTemp = temps[firstNodeIdx];
    const secondNodeTemp = temps[secondNodeIdx];

    if (conn.kind === 'rad') {
      return (Math.pow(firstNodeTemp, 4) - Math.pow(secondNodeTemp, 4)) / conn.resistanceDegKPerW;
    } else {
      return (firstNodeTemp - secondNodeTemp) / conn.resistanceDegKPerW;
    }
  });
}

export function numTimeSteps(timeStepS: number, totalTimeS: number): number {
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
  return matrixUtils.add(temps, deltaT);
}

export function shapeOutput(
  data: ModelInput,
  timeSeriesS: number[],
  outputTemps: number[][],
  outputHeatTransfer: number[][],
): Omit<ModelOutput, 'computeTimeS'> {
  const flatTemps = outputTemps.map((temp) => toCelcius(temp));

  const temps: NodeResult[] = data.nodes.map((node: HSNode, idx: number) => {
    return {
      node: { ...node },
      tempDegC: flatTemps.map((temp) => temp[idx]),
    };
  });

  const heatTransfer: ConnectionResult[] = data.connections.map((connection: HSConnection, idx: number) => {
    return {
      connection: { ...connection },
      heatTransferW: outputHeatTransfer.map((ht) => ht[idx]),
    };
  });

  return {
    timeSeriesS: matrixUtils.fixRoundOffErrors(timeSeriesS),
    timeStepS: timeSeriesS[1],
    totalTimeS: timeSeriesS[timeSeriesS.length - 1],
    numTimeSteps: timeSeriesS.length,
    nodeResults: temps,
    connectionResults: heatTransfer,
  };
}

export const emptyOutput: ModelOutput = {
  timeSeriesS: [],
  timeStepS: 0,
  totalTimeS: 0,
  numTimeSteps: 0,
  nodeResults: [],
  connectionResults: [],
  computeTimeS: 0,
};

export function run(data: ModelInput): ModelOutput {
  const start = performance.now();
  const errors = validateInputs(data);
  if (errors.length > 0) {
    return { ...emptyOutput, errors: errors.map((e) => ({ name: e.name, message: e.message })) };
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

  // account for time 0
  timeSeriesS.push(timeSeriesS[timeSeriesS.length - 1] + data.timeStepS);

  timeStepRange.forEach((step) => {
    const mostRecentTemps = outputTemps[step];
    const newTemps = calculateNewTemps(data.timeStepS, mostRecentTemps, A, A4, B);
    const adjustedTemps = tempsWithBoundary(data.nodes, mostRecentTemps, newTemps);
    const newHeatTransfer = getHeatTransfer(adjustedTemps, data.nodes, data.connections);
    outputTemps.push(adjustedTemps);
    outputHeatTransfer.push(newHeatTransfer);
  });

  return {
    ...shapeOutput(data, timeSeriesS, outputTemps, outputHeatTransfer),
    computeTimeS: (performance.now() - start) / 1000,
  };
}
