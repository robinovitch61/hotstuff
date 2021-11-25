import {
  calculateNewTemps,
  calculateTerm,
  createAMatrix,
  createBVector,
  emptyOutput,
  fromKey,
  getHeatTransfer,
  getNodeTempsDegK,
  KELVIN,
  makeConnection,
  makeNode,
  ModelInput,
  ModelOutput,
  numTimeSteps,
  run,
  shapeOutput,
  tempsWithBoundary,
  toCelcius,
  toKelvin,
  toKey,
  validateInputs,
} from '../hotstuff';

const firstNode = makeNode({
  name: 'test',
  temperatureDegC: 10,
  capacitanceJPerDegK: 10000,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = makeNode({
  name: 'test2',
  temperatureDegC: 20,
  capacitanceJPerDegK: 20000,
  powerGenW: 0,
  isBoundary: false,
});

const thirdNode = makeNode({
  name: 'test3',
  temperatureDegC: 40,
  capacitanceJPerDegK: 40000,
  powerGenW: 0,
  isBoundary: true,
});

const connFirstSecond = makeConnection({
  firstNode: firstNode,
  secondNode: secondNode,
  resistanceDegKPerW: 100,
  kind: 'cond',
});

const connSecondThird = makeConnection({
  firstNode: secondNode,
  secondNode: thirdNode,
  resistanceDegKPerW: 100,
  kind: 'conv',
});

const connRadSecondThird = makeConnection({
  firstNode: secondNode,
  secondNode: thirdNode,
  resistanceDegKPerW: 50,
  kind: 'rad',
});

const connFirstThird = makeConnection({
  firstNode: firstNode,
  secondNode: thirdNode,
  resistanceDegKPerW: 75,
  kind: 'conv',
});

const modelInput: ModelInput = {
  nodes: [firstNode, secondNode],
  connections: [connFirstSecond],
  timeStepS: 0.1,
  totalTimeS: 10,
};

describe('key serdes', () => {
  test('toKey', () => {
    const key = toKey('test1', 'test2');
    expect(key).toBe('test1-test2');
  });

  test('fromKey', () => {
    const [first, second] = fromKey('test1-test2');
    expect(first).toBe('test1');
    expect(second).toBe('test2');
  });
});

describe('validateInputs', () => {
  test('valid input does not throw', () => {
    expect(() => validateInputs(modelInput)).not.toThrow();
  });

  test('timeStepS is valid', () => {
    expect(validateInputs({ ...modelInput, timeStepS: 0 }).length).toBeGreaterThan(0);
    expect(validateInputs({ ...modelInput, timeStepS: -1 }).length).toBeGreaterThan(0);
  });

  test('totalTimeS is valid', () => {
    expect(validateInputs({ ...modelInput, totalTimeS: 0 }).length).toBeGreaterThan(0);
    expect(validateInputs({ ...modelInput, totalTimeS: -1 }).length).toBeGreaterThan(0);
    expect(
      validateInputs({
        ...modelInput,
        timeStepS: 1,
        totalTimeS: 0.5,
      }).length,
    ).toBeGreaterThan(0);
  });

  test('nodes have unique ids', () => {
    expect(validateInputs({ ...modelInput, nodes: [firstNode, firstNode] }).length).toBeGreaterThan(0);
  });

  test('temperatureDegC is valid', () => {
    expect(
      validateInputs({ ...modelInput, nodes: [firstNode, { ...secondNode, temperatureDegC: -KELVIN - 1 }] }).length,
    ).toBeGreaterThan(0);
  });

  test('capacitanceJPerDegK is valid', () => {
    expect(
      validateInputs({ ...modelInput, nodes: [firstNode, { ...secondNode, capacitanceJPerDegK: -1 }] }).length,
    ).toBeGreaterThan(0);
  });

  test('connections correspond to real node ids', () => {
    expect(
      validateInputs({
        ...modelInput,
        connections: [
          makeConnection({
            firstNode: firstNode,
            secondNode: { ...secondNode, id: 'notANode' },
            resistanceDegKPerW: 10,
            kind: 'conv',
          }),
        ],
      }).length,
    ).toBeGreaterThan(0);

    expect(
      validateInputs({
        ...modelInput,
        connections: [
          makeConnection({
            firstNode: { ...firstNode, id: 'notANode' },
            secondNode: secondNode,
            resistanceDegKPerW: 10,
            kind: 'cond',
          }),
        ],
      }).length,
    ).toBeGreaterThan(0);
  });

  test('connections have valid resistances', () => {
    expect(
      validateInputs({
        ...modelInput,
        connections: [
          makeConnection({
            firstNode: firstNode,
            secondNode: secondNode,
            resistanceDegKPerW: -1,
            kind: 'conv',
          }),
        ],
      }).length,
    ).toBeGreaterThan(0);
  });

  test("connections don't point to themselves", () => {
    expect(
      validateInputs({
        ...modelInput,
        connections: [
          makeConnection({
            firstNode: firstNode,
            secondNode: firstNode,
            resistanceDegKPerW: 10,
            kind: 'cond',
          }),
        ],
      }).length,
    ).toBeGreaterThan(0);
  });

  test('ok if conduction + radiation or convection + radiation between same nodes', () => {
    expect(
      validateInputs({
        ...modelInput,
        nodes: [firstNode, secondNode, thirdNode],
        connections: [
          makeConnection({
            firstNode: firstNode,
            secondNode: secondNode,
            resistanceDegKPerW: 10,
            kind: 'cond',
          }),
          makeConnection({
            firstNode: secondNode,
            secondNode: firstNode,
            resistanceDegKPerW: 10,
            kind: 'rad',
          }),
          makeConnection({
            firstNode: firstNode,
            secondNode: thirdNode,
            resistanceDegKPerW: 10,
            kind: 'conv',
          }),
          makeConnection({
            firstNode: thirdNode,
            secondNode: firstNode,
            resistanceDegKPerW: 10,
            kind: 'rad',
          }),
        ],
      }).length,
    ).toEqual(0);
  });

  test('no simultaneous conduction and convection between same nodes', () => {
    expect(
      validateInputs({
        ...modelInput,
        connections: [
          makeConnection({
            firstNode: firstNode,
            secondNode: secondNode,
            resistanceDegKPerW: 10,
            kind: 'cond',
          }),
          makeConnection({
            firstNode: secondNode,
            secondNode: firstNode,
            resistanceDegKPerW: 10,
            kind: 'conv',
          }),
        ],
      }).length,
    ).toBeGreaterThan(0);
  });
});

describe('calculateTerm', () => {
  test('with expected units', () => {
    expect(calculateTerm(10, 10)).toEqual(1 / 10 / 10);
  });
});

describe('createAMatrix', () => {
  test('no nodes, no connections', () => {
    const [aMatrix, aMatrix4] = createAMatrix([], []);
    expect(aMatrix).toEqual([[]]);
    expect(aMatrix4).toEqual([[]]);
  });

  test('single node, no connections', () => {
    const [aMatrix, aMatrix4] = createAMatrix([firstNode], []);
    expect(aMatrix).toEqual([[0]]);
    expect(aMatrix4).toEqual([[0]]);
  });

  test('two nodes, no connections', () => {
    const [aMatrix, aMatrix4] = createAMatrix([firstNode, secondNode], []);
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
    const [aMatrix, aMatrix4] = createAMatrix([], [connFirstSecond]);
    expect(aMatrix).toEqual([[]]);
    expect(aMatrix4).toEqual([[]]);
  });

  test('two connected nodes', () => {
    const nodes = [firstNode, secondNode];
    const connections = [connFirstSecond];
    const [aMatrix, aMatrix4] = createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.000001, 0.000001],
      [5e-7, -5e-7],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('with conductive and convective connections', () => {
    const nodes = [firstNode, secondNode, thirdNode];
    const connections = [connFirstSecond, connSecondThird];
    const [aMatrix, aMatrix4] = createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.000001, 0.000001, 0],
      [0.0000005, -0.000001, 0.0000005],
      [0, 0.00000025, -0.00000025],
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
    const [aMatrix, aMatrix4] = createAMatrix(nodes, connections);
    expect(aMatrix).toEqual([
      [-0.000001, 0.000001, 0],
      [0.0000005, -0.0000005, 0],
      [0, 0, 0],
    ]);
    expect(aMatrix4).toEqual([
      [0, 0, 0],
      [0, -0.000001, 0.000001],
      [0, 0.0000005, -0.0000005],
    ]);
  });
});

describe('createBVector', () => {
  test('empty input', () => {
    expect(createBVector([])).toEqual([]);
  });

  test('single node input', () => {
    expect(createBVector([firstNode])).toEqual([0.008]);
  });

  test('two node input', () => {
    expect(createBVector([firstNode, secondNode])).toEqual([0.008, 0]);
  });
});

describe('toKelvin', () => {
  test('empty input', () => {
    expect(toKelvin([])).toEqual([]);
  });

  test('single entry input', () => {
    expect(toKelvin([1])).toEqual([1 + KELVIN]);
  });

  test('two entry input', () => {
    expect(toKelvin([1, 2])).toEqual([1 + KELVIN, 2 + KELVIN]);
  });
});

describe('toCelcius', () => {
  test('empty input', () => {
    expect(toCelcius([])).toEqual([]);
  });

  test('single entry input', () => {
    expect(toCelcius([KELVIN])).toEqual([0]);
  });

  test('two entry input', () => {
    expect(toCelcius([KELVIN + 1, KELVIN + 2])).toEqual([1, 2]);
  });
});

describe('getNodeTempsDegK', () => {
  test('empty input', () => {
    expect(getNodeTempsDegK([])).toEqual([]);
  });

  test('single node input', () => {
    expect(getNodeTempsDegK([firstNode])).toEqual([10 + KELVIN]);
  });

  test('two node input', () => {
    expect(getNodeTempsDegK([firstNode, secondNode])).toEqual([10 + KELVIN, 20 + KELVIN]);
  });
});

describe('tempsWithBoundary', () => {
  test('empty input', () => {
    expect(tempsWithBoundary([], [], [])).toEqual([]);
  });

  test('non-boundary node inputs', () => {
    expect(tempsWithBoundary([firstNode, secondNode], [1, 2], [3, 4])).toEqual([3, 4]);
  });

  test('with boundary node input', () => {
    expect(tempsWithBoundary([firstNode, secondNode, thirdNode], [1, 2, 3], [3, 4, 5])).toEqual([3, 4, 3]);
  });
});

describe('getHeatTransfer', () => {
  test('empty input', () => {
    expect(getHeatTransfer([], [], [])).toEqual([]);
  });

  test('simple input', () => {
    expect(getHeatTransfer([1, 2], [firstNode, secondNode], [connFirstSecond])).toEqual([-0.01]);
  });

  test('three node input without rad', () => {
    expect(getHeatTransfer([1, 2, 3], [firstNode, secondNode, thirdNode], [connFirstSecond, connSecondThird])).toEqual([
      -0.01,
      -0.01,
    ]);
  });

  test('three node input with rad', () => {
    expect(
      getHeatTransfer([1, 2, 3], [firstNode, secondNode, thirdNode], [connFirstSecond, connRadSecondThird]),
    ).toEqual([-0.01, -1.3]);
  });
});

describe('numTimeSteps', () => {
  test('totalTimeS < timeStepS', () => {
    expect(numTimeSteps(100, 10)).toEqual(0);
  });

  test('same values', () => {
    expect(numTimeSteps(10, 10)).toEqual(1);
  });

  test('double', () => {
    expect(numTimeSteps(5, 10)).toEqual(2);
  });

  test('ceil', () => {
    expect(numTimeSteps(4, 10)).toEqual(3);
  });
});

describe('getNewTemps', () => {
  test('2 node system temps', () => {
    const timeStepS = 0.1;
    const temps = [1, 2];
    const A = [
      [-1, 2],
      [3, -4],
    ];
    const A4 = [
      [-1, 2],
      [3, -4],
    ];
    const B = [4, 5];
    const newTemps = calculateNewTemps(timeStepS, temps, A, A4, B);
    expect(newTemps.length).toEqual(2);
    expect(newTemps[0]).toBeCloseTo(4.8);
    expect(newTemps[1]).toBeCloseTo(-4.1);
  });
});

describe('shapeOutput', () => {
  test('2 node system output', () => {
    const modelInput: ModelInput = {
      nodes: [firstNode, secondNode],
      connections: [connFirstSecond],
      timeStepS: 0.1,
      totalTimeS: 0.1,
    };
    const timeSeriesS = [0, 0.1];
    const outputTemps = [
      [firstNode.temperatureDegC + KELVIN, secondNode.temperatureDegC + KELVIN],
      [10 + KELVIN, 20 + KELVIN],
    ];
    const outputHeatTransfer = [[30], [40]];
    const output = shapeOutput(modelInput, timeSeriesS, outputTemps, outputHeatTransfer);
    const expectedOutput: Omit<ModelOutput, 'computeTimeS'> = {
      timeSeriesS,
      timeStepS: modelInput.timeStepS,
      totalTimeS: 0.1,
      numTimeSteps: 2,
      nodeResults: [
        {
          node: firstNode,
          tempDegC: [firstNode.temperatureDegC, 10],
        },
        {
          node: secondNode,
          tempDegC: [secondNode.temperatureDegC, 20],
        },
      ],
      connectionResults: [
        {
          connection: connFirstSecond,
          heatTransferW: [30, 40],
        },
      ],
    };
    expect(output).toEqual(expectedOutput);
  });
});

describe('run', () => {
  test('empty input', () => {
    const input = {
      nodes: [],
      connections: [],
      timeStepS: 0,
      totalTimeS: 0,
    };
    const { errors, ...output } = run(input);
    expect(errors).not.toBeUndefined();
    expect(!!errors && errors.map((e) => e.name).sort()).toEqual([
      'TimeStepValidationError',
      'TotalTimeValidationError',
    ]);
    expect(output).toEqual(emptyOutput);
  });

  test('single timestep input', () => {
    const input = {
      nodes: [firstNode, secondNode],
      connections: [connFirstSecond],
      timeStepS: 0.1,
      totalTimeS: 0.1,
    };
    const output = run(input);
    expect(output.timeSeriesS).toEqual([0, 0.1]);
    expect(output.numTimeSteps).toEqual(2);
    expect(output.totalTimeS).toEqual(0.1);
    expect(output.timeStepS).toEqual(0.1);
    output.nodeResults.forEach((temp) => {
      expect(temp.tempDegC.length).toEqual(2);
    });
    output.connectionResults.forEach((ht) => {
      expect(ht.heatTransferW.length).toEqual(2);
    });
  });

  test('real inputs, 10 timeSteps', () => {
    const nodes = [firstNode, secondNode, thirdNode];
    const connections = [connFirstSecond, connRadSecondThird, connFirstThird];
    const input: ModelInput = {
      nodes,
      connections,
      timeStepS: 0.01,
      totalTimeS: 0.1,
    };
    const output = run(input);
    expect(output.timeSeriesS).toEqual([0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1]);
    const expectedTemps = [
      [
        10.0,
        10.000080099999991,
        10.000160423117393,
        10.00024071752108,
        10.000321018777754,
        10.000401318486126,
        10.000481618547894,
        10.000561918528035,
        10.000642218525854,
        10.000722518518671,
        10.000802818511602,
      ],
      [
        20.0,
        42.3118211547,
        39.44052646748196,
        40.125908403220535,
        39.971157107097724,
        40.006580831277574,
        39.99849695336371,
        40.000343036625736,
        39.999921521640374,
        40.000017769415194,
        39.99999579260151,
      ],
      [40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0],
    ];

    output.nodeResults.map((temps, nodeIdx) => {
      temps.tempDegC.map((temp, tempIdx) => {
        expect(temp).toBeCloseTo(expectedTemps[nodeIdx][tempIdx]);
      });
    });

    const expectedHeatTransfers = [
      [
        -0.1,
        -0.32311741054700005,
        -0.2944036604436457,
        -0.30125667685699453,
        -0.2997083608831997,
        -0.3000617951279145,
        -0.2999801533481582,
        -0.299997811180977,
        -0.2999927930311452,
        -0.29999295250896524,
        -0.29999192974089905,
      ],
      [
        -44623642.409399986,
        5742589.051318664,
        -1370764.1658807755,
        309502.290988884,
        -70847.74806800843,
        16167.455765914918,
        -3692.4665042114257,
        842.7299729156495,
        -192.79554244995117,
        43.65363441467285,
        -10.336199264526368,
      ],
      [
        -0.4,
        -0.39999893200000014,
        -0.39999786102510143,
        -0.39999679043305225,
        -0.39999571974962994,
        -0.3999946490868517,
        -0.3999935784193614,
        -0.3999925077529595,
        -0.39999143708632195,
        -0.39999036641975105,
        -0.39998929575317865,
      ],
    ];

    output.connectionResults.map((hts, connIdx) => {
      hts.heatTransferW.map((ht, htIdx) => {
        expect(ht).toBeCloseTo(expectedHeatTransfers[connIdx][htIdx]);
      });
    });

    expect(output.computeTimeS).toBeLessThan(0.01);
  });

  test('real inputs, 10 timeSteps, conduction and radiation between same node pairs', () => {
    // 10 + 0.01/10000*((20-10)/1000 + ((20+273.15)^4 - (10+273.15)^4)/3000 + 80)
    // 20 + 0.01/20000*((10-20)/1000 + ((10+273.15)^4 - (20+273.15)^4)/3000 + 80)
    const nodes = [firstNode, secondNode];
    const connections = [
      makeConnection({
        firstNode: firstNode,
        secondNode: secondNode,
        resistanceDegKPerW: 1000,
        kind: 'cond',
      }),
      makeConnection({
        firstNode: secondNode,
        secondNode: firstNode,
        resistanceDegKPerW: 3000,
        kind: 'rad',
      }),
    ];
    const input: ModelInput = {
      nodes,
      connections,
      timeStepS: 0.01,
      totalTimeS: 0.1,
    };
    const output = run(input);
    expect(output.timeSeriesS).toEqual([0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1]);
    const expectedTemps = [
      [
        10,
        10.319178943244992,
        10.623325651534174,
        10.913125821345261,
        11.189235894837566,
        11.452284125761366,
        11.702871623084718,
        11.941573371177128,
        12.168939225587451,
        12.385494883639637,
        12.591742829238171,
      ],
      [
        20,
        19.840450528377517,
        19.68841717423294,
        19.543557089327408,
        19.405542052581268,
        19.27405793711938,
        19.14880418845769,
        19.029493314411468,
        18.91585038720632,
        18.80761255818021,
        18.704528585380956,
      ],
    ];

    output.nodeResults.map((temps, nodeIdx) => {
      temps.tempDegC.map((temp, tempIdx) => {
        expect(temp).toBeCloseTo(expectedTemps[nodeIdx][tempIdx]);
      });
    });

    const expectedHeatTransfers = [
      [
        -0.01,
        -0.009521271585132524,
        -0.009065091522698765,
        -0.008630431267982146,
        -0.008216306157743701,
        -0.007821773811358014,
        -0.00744593256537297,
        -0.007087919943234339,
        -0.006746911161618868,
        -0.0064221176745405725,
        -0.006112785756142785,
      ],
      [
        319098.9332449999,
        304066.698767897,
        289720.1607460047,
        276030.06486188824,
        262968.22270747024,
        250507.48950159232,
        238621.7406464777,
        227285.84732242743,
        216475.6513052651,
        206167.9391764059,
        196340.4160813001,
      ],
    ];

    output.connectionResults.map((hts, connIdx) => {
      hts.heatTransferW.map((ht, htIdx) => {
        expect(ht).toBeCloseTo(expectedHeatTransfers[connIdx][htIdx]);
      });
    });

    expect(output.computeTimeS).toBeLessThan(0.01);
  });
});
