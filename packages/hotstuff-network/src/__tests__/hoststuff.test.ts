import * as hs from '../hotstuff';
import { makeId, ModelInputs, validateInputs } from '../hotstuff';
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
        heatTransfer: Qty('10 W'),
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
            heatTransfer: Qty('10 W'),
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
            heatTransfer: Qty('10 W'),
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
            heatTransfer: Qty('10 W'),
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
            heatTransfer: Qty('10 W'),
          },
        ],
      }),
    ).toThrow();
  });
});

describe('calculateTerm', () => {
  console.log('TODO');
});

// describe('createAMatrix', () => {
//   const nodes = [
//     {
//       id:
//     }
//     ];
//   const aMatrix = hs.createAMatrix();
// });
