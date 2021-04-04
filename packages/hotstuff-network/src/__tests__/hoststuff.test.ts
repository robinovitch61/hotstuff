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
  const firstNode = {
    id: hs.makeId(),
    name: 'first',
    temperature: Qty('10 degC'),
    capacitance: Qty('10 J/degK'),
    powerGen: Qty('10W'),
    isBoundary: false,
  };

  const secondNode = {
    id: hs.makeId(),
    name: 'second',
    temperature: Qty('10 degC'),
    capacitance: Qty('10 J/degK'),
    powerGen: Qty('10W'),
    isBoundary: true,
  };

  const data: ModelInputs = {
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
    timeStep: 0.1,
  };

  test('valid input does not throw', () => {
    expect(() => validateInputs(data)).not.toThrow();
  });

  test('timestep', () => {
    expect(() => validateInputs({ ...data, timeStep: 0 })).toThrow();
    expect(() => validateInputs({ ...data, timeStep: -1 })).toThrow();
  });

  test('nodes', () => {
    // duplicate ids in nodes
    expect(() => validateInputs({ ...data, nodes: [firstNode, firstNode] })).toThrow();

    // temperature
    expect(() =>
      validateInputs({ ...data, nodes: [firstNode, { ...secondNode, temperature: Qty('-1 degK') }] }),
    ).toThrow();

    // capacitance
    expect(() =>
      validateInputs({ ...data, nodes: [firstNode, { ...secondNode, capacitance: Qty('-1 J/degK') }] }),
    ).toThrow();
  });

  test('connections', () => {
    // connections include id that isn't a node
    expect(() =>
      validateInputs({
        ...data,
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
        ...data,
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
});
