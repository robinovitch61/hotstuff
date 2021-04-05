import * as hs from '../hotstuff';
import { Connection, makeId, ModelInput, validateInputs } from '../hotstuff';
import { matrixUtils } from '../matrixUtils';

const firstNode = hs.makeNode({
  name: 'test',
  temperatureDegC: 10,
  capacitanceJPerDegK: 10,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = hs.makeNode({
  name: 'test2',
  temperatureDegC: 20,
  capacitanceJPerDegK: 20,
  powerGenW: 0,
  isBoundary: false,
});

const thirdNode = hs.makeNode({
  name: 'test3',
  temperatureDegC: 40,
  capacitanceJPerDegK: 40,
  powerGenW: -10,
  isBoundary: false,
});

const connFirstSecond: Connection = {
  source: firstNode,
  target: secondNode,
  resistanceDegKPerW: 100,
  kind: 'bi',
};

const connSecondThird: Connection = {
  source: secondNode,
  target: thirdNode,
  resistanceDegKPerW: 100,
  kind: 'uni',
};

const connRadSecondThird: Connection = {
  source: secondNode,
  target: thirdNode,
  resistanceDegKPerW: 100,
  kind: 'rad',
};

describe('key serdes', () => {
  test('toKey', () => {
    const key = hs.toKey('test1', 'test2');
    expect(key).toBe('test1-test2');
  });

  test('fromKey', () => {
    const [first, second] = hs.fromKey('test1-test2');
    expect(first).toBe('test1');
    expect(second).toBe('test2');
  });
});

describe('validate inputs', () => {
  const firstNode = hs.makeNode({
    name: 'first',
    temperatureDegC: 10,
    capacitanceJPerDegK: 10,
    powerGenW: 10,
    isBoundary: false,
  });

  const secondNode = {
    id: hs.makeId(),
    name: 'second',
    temperatureDegC: 10,
    capacitanceJPerDegK: 10,
    powerGenW: 10,
    isBoundary: true,
  };

  const modelInputs: ModelInput = {
    nodes: [firstNode, secondNode],
    connections: [
      {
        source: firstNode,
        target: secondNode,
        resistanceDegKPerW: 10,
        kind: 'bi',
      },
    ],
    timestepS: 0.1,
    runTimeS: 10,
  };

  test('valid input does not throw', () => {
    expect(() => validateInputs(modelInputs)).not.toThrow();
  });

  test('timestepS is valid', () => {
    expect(() => validateInputs({ ...modelInputs, timestepS: 0 })).toThrow();
    expect(() => validateInputs({ ...modelInputs, timestepS: -1 })).toThrow();
  });

  test('runTimeS is valid', () => {
    expect(() => validateInputs({ ...modelInputs, runTimeS: 0 })).toThrow();
    expect(() => validateInputs({ ...modelInputs, runTimeS: -1 })).toThrow();
    expect(() =>
      validateInputs({
        ...modelInputs,
        timestepS: 1,
        runTimeS: 0.5,
      }),
    ).toThrow();
  });

  test('nodes have unique ids', () => {
    expect(() => validateInputs({ ...modelInputs, nodes: [firstNode, firstNode] })).toThrow();
  });

  test('temperatureDegC is valid', () => {
    expect(() =>
      validateInputs({ ...modelInputs, nodes: [firstNode, { ...secondNode, temperatureDegC: -1 }] }),
    ).toThrow();
  });

  test('capacitanceJPerDegK is valid', () => {
    expect(() =>
      validateInputs({ ...modelInputs, nodes: [firstNode, { ...secondNode, capacitanceJPerDegK: -1 }] }),
    ).toThrow();
  });

  test('connections correspond to real node ids', () => {
    expect(() =>
      validateInputs({
        ...modelInputs,
        connections: [
          {
            source: firstNode,
            target: { ...secondNode, id: 'notANode' },
            resistanceDegKPerW: 10,
            kind: 'bi',
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      validateInputs({
        ...modelInputs,
        connections: [
          {
            source: { ...firstNode, id: 'notANode' },
            target: secondNode,
            resistanceDegKPerW: 10,
            kind: 'bi',
          },
        ],
      }),
    ).toThrow();
  });

  test('connections have valid resistances', () => {
    expect(() =>
      validateInputs({
        ...modelInputs,
        connections: [
          {
            source: firstNode,
            target: secondNode,
            resistanceDegKPerW: -1,
            kind: 'bi',
          },
        ],
      }),
    ).toThrow();
  });

  test("connections don't point to themselves", () => {
    expect(() =>
      validateInputs({
        ...modelInputs,
        connections: [
          {
            source: firstNode,
            target: firstNode,
            resistanceDegKPerW: 10,
            kind: 'bi',
          },
        ],
      }),
    ).toThrow();
  });
});

describe('calculateTerm', () => {
  test('with expected units', () => {
    expect(hs.calculateTerm(10, 10)).toEqual(1 / 10 / 10);
  });
});

describe('createAMatrix', () => {
  test('no nodes, no connections', () => {
    const [aMatrix, aMatrix4] = hs.createAMatrix([], []);
    expect(aMatrix).toEqual([[]]);
    expect(aMatrix4).toEqual([[]]);
  });

  test('single node, no connections', () => {
    const [aMatrix, aMatrix4] = hs.createAMatrix([firstNode], []);
    expect(aMatrix).toEqual([[0]]);
    expect(aMatrix4).toEqual([[0]]);
  });

  test('two nodes, no connections', () => {
    const [aMatrix, aMatrix4] = hs.createAMatrix([firstNode, secondNode], []);
    expect(aMatrix).toEqual([
      [0, 0],
      [0, 0],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('no nodes, one connection', () => {
    const [aMatrix, aMatrix4] = hs.createAMatrix([], [connFirstSecond]);
    expect(aMatrix).toEqual([[]]);
    expect(aMatrix4).toEqual([[]]);
  });

  test('two connected nodes', () => {
    const nodes = [firstNode, secondNode];
    const connections = [connFirstSecond];
    const [aMatrix, aMatrix4] = hs.createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.001, 0.001],
      [0.0005, -0.0005],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('with uni connection', () => {
    const nodes = [firstNode, secondNode, thirdNode];
    const connections = [connFirstSecond, connSecondThird];
    const [aMatrix, aMatrix4] = hs.createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.001, 0.001, 0],
      [0.0005, -0.0005, 0],
      [0, 0.00025, -0.00025],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test('with rad connection', () => {
    const nodes = [firstNode, secondNode, thirdNode];
    const connections = [connFirstSecond, connRadSecondThird];
    const [aMatrix, aMatrix4] = hs.createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.001, 0.001, 0],
      [0.0005, -0.0005, 0],
      [0, 0, 0],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0, 0],
      [0, -0.0005, 0.0005],
      [0, 0, 0],
    ]);
  });
});

describe('createBVector', () => {
  test('empty input', () => {
    expect(hs.createBVector([])).toEqual([[]]);
  });

  test('single node input', () => {
    expect(hs.createBVector([firstNode])).toEqual([[8]]);
  });

  test('two node input', () => {
    expect(hs.createBVector([firstNode, secondNode])).toEqual([[8], [0]]);
  });
});

describe('getNodeTemps', () => {
  test('empty input', () => {
    expect(hs.getNodeTemps([])).toEqual([[]]);
  });

  test('single node input', () => {
    expect(hs.getNodeTemps([firstNode])).toEqual([[10]]);
  });

  test('two node input', () => {
    expect(hs.getNodeTemps([firstNode, secondNode])).toEqual([[10], [20]]);
  });
});

describe('numTimesteps', () => {
  test('runTimeS < timestepS', () => {
    expect(hs.numTimesteps(100, 10)).toEqual(0);
  });

  test('same values', () => {
    expect(hs.numTimesteps(10, 10)).toEqual(1);
  });

  test('double', () => {
    expect(hs.numTimesteps(5, 10)).toEqual(2);
  });

  test('ceil', () => {
    expect(hs.numTimesteps(4, 10)).toEqual(3);
  });
});

describe('getNewTemps', () => {
  test('contrived 2 node system', () => {
    const timestepS = 0.1;
    const temps = [[1], [2]];
    const A = [
      [-1, 2],
      [3, -4],
    ];
    const A4 = [
      [-1, 2],
      [3, -4],
    ];
    const B = [[4], [5]];
    const newTemps = hs.getNewTemps(timestepS, temps, A, A4, B);
    expect(matrixUtils.size(newTemps).width).toEqual(1);
    expect(matrixUtils.size(newTemps).height).toEqual(2);
    expect(newTemps[0][0]).toBeCloseTo(4.8);
    expect(newTemps[1][0]).toBeCloseTo(-4.1);
  });
});
