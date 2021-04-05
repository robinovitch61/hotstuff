import * as hs from '../hotstuff';
import { Connection, makeId, ModelInputs, validateInputs } from '../hotstuff';
import Qty = require('js-quantities');

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
    temperature: Qty('10 degC'),
    capacitance: Qty('10 J/degK'),
    powerGen: Qty('10W'),
    isBoundary: false,
  });

  const secondNode = {
    id: hs.makeId(),
    name: 'second',
    temperature: Qty('10 degC'),
    capacitance: Qty('10 J/degK'),
    powerGen: Qty('10W'),
    isBoundary: true,
  };

  const modelInputs: ModelInputs = {
    nodes: [firstNode, secondNode],
    connections: [
      {
        source: firstNode,
        target: secondNode,
        resistance: Qty('10 degK/W'),
        kind: 'bi',
      },
    ],
    timeStep: Qty('0.1 s'),
    runTime: Qty('10 s'),
  };

  test('valid input does not throw', () => {
    expect(() => validateInputs(modelInputs)).not.toThrow();
  });

  test('timestep is valid', () => {
    expect(() => validateInputs({ ...modelInputs, timeStep: Qty('0 s') })).toThrow();
    expect(() => validateInputs({ ...modelInputs, timeStep: Qty('-1 s') })).toThrow();
  });

  test('runTime is valid', () => {
    expect(() => validateInputs({ ...modelInputs, runTime: Qty('0 s') })).toThrow();
    expect(() => validateInputs({ ...modelInputs, runTime: Qty('-1 s') })).toThrow();
    expect(() =>
      validateInputs({
        ...modelInputs,
        timeStep: Qty('1 s'),
        runTime: Qty('0.5s'),
      }),
    ).toThrow();
  });

  test('nodes have unique ids', () => {
    expect(() => validateInputs({ ...modelInputs, nodes: [firstNode, firstNode] })).toThrow();
  });

  test('temperature is valid', () => {
    // temperature
    expect(() =>
      validateInputs({ ...modelInputs, nodes: [firstNode, { ...secondNode, temperature: Qty('-1 degK') }] }),
    ).toThrow();
  });

  test('capacitance is valid', () => {
    expect(() =>
      validateInputs({ ...modelInputs, nodes: [firstNode, { ...secondNode, capacitance: Qty('-1 J/degK') }] }),
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
            resistance: Qty('10 degK/W'),
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
            resistance: Qty('10 degK/W'),
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
            resistance: Qty('-1 degK/W'),
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
            resistance: Qty('10 degK/W'),
            kind: 'bi',
          },
        ],
      }),
    ).toThrow();
  });
});

describe('calculateTerm', () => {
  test('with expected units', () => {
    expect(hs.calculateTerm(Qty('10 J/degC'), Qty('10 degK/W'))).toEqual(1 / 10 / 10);
  });

  test('with unit conversion', () => {
    // floating point rounding stuff going on with conversions, assume ok for now
    expect(hs.calculateTerm(Qty('10 MJ/degC'), Qty('10 udegK/W'))).toBeCloseTo(1 / 10 / 10);
  });
});

describe('createAMatrix', () => {
  const firstNode = hs.makeNode({
    name: 'test',
    temperature: Qty('10 degC'),
    capacitance: Qty('10 J/degK'),
    powerGen: Qty('80 W'),
    isBoundary: false,
  });

  const secondNode = hs.makeNode({
    name: 'test2',
    temperature: Qty('20 degC'),
    capacitance: Qty('20 J/degK'),
    powerGen: Qty('0 W'),
    isBoundary: false,
  });

  const thirdNode = hs.makeNode({
    name: 'test3',
    temperature: Qty('40 degC'),
    capacitance: Qty('40 J/degK'),
    powerGen: Qty('-10 W'),
    isBoundary: false,
  });

  const connFirstSecond: Connection = {
    source: firstNode,
    target: secondNode,
    resistance: Qty('100 degK/W'),
    kind: 'bi',
  };

  const connSecondThird: Connection = {
    source: secondNode,
    target: thirdNode,
    resistance: Qty('100 degK/W'),
    kind: 'uni',
  };

  const connRadSecondThird: Connection = {
    source: secondNode,
    target: thirdNode,
    resistance: Qty('100 degK/W'),
    kind: 'rad',
  };

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
