import { matrixUtils } from '../matrixUtils';

describe('add', () => {
  test('empty input should throw', () => {
    expect(() => matrixUtils.add([], [1])).toThrow();
  });

  test('1x1 addition', () => {
    expect(matrixUtils.add([1], [1])).toEqual([2]);
  });

  test('1x2 addition', () => {
    const first = [1, 3];
    const second = [2, 4];
    const sum = [3, 7];
    expect(matrixUtils.add(first, second)).toEqual(sum);
  });
});

describe('addScalar', () => {
  test('empty input should return empty input', () => {
    expect(matrixUtils.addScalar([], 1)).toEqual([]);
  });

  test('1x1 scalar addition', () => {
    expect(matrixUtils.addScalar([1], 1)).toEqual([2]);
  });

  test('1x2 scalar addition', () => {
    const first = [2, 4];
    const second = 2;
    const sum = [4, 6];
    expect(matrixUtils.addScalar(first, second)).toEqual(sum);
  });
});

describe('mult', () => {
  test('empty input', () => {
    expect(matrixUtils.mult([[]], [1])).toEqual([]);
  });

  test('1x1 multiplication', () => {
    expect(matrixUtils.mult([[1]], [2])).toEqual([2]);
  });

  test('2x2 * 2x1 multiplication', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const second = [1, 2];
    const product = [5, 11];
    expect(matrixUtils.mult(first, second)).toEqual(product);
  });

  test('weirdo matrix throws', () => {
    const first = [[1, 2], [3]];
    const second = [1, 2];
    expect(() => matrixUtils.mult(first, second)).toThrow();
  });
});

describe('multScalar', () => {
  test('empty input', () => {
    expect(matrixUtils.multScalar([], 1)).toEqual([]);
  });

  test('1x1 scalar multiplication', () => {
    expect(matrixUtils.multScalar([1], 2)).toEqual([2]);
  });

  test('2x1 scalar multiplication', () => {
    const first = [1, 3];
    const product = [2, 6];
    expect(matrixUtils.multScalar(first, 2)).toEqual(product);
  });
});

describe('pow', () => {
  test('empty input', () => {
    expect(matrixUtils.pow([], 2)).toEqual([]);
  });

  test('1x1 pow', () => {
    expect(matrixUtils.pow([2], 2)).toEqual([4]);
  });

  test('1x2 pow', () => {
    const first = [1, 3];
    const product = [1, 9];
    expect(matrixUtils.pow(first, 2)).toEqual(product);
  });
});

describe('zeros2d', () => {
  test('0x0 case', () => {
    expect(matrixUtils.zeros2d(0, 0)).toEqual([[]]);
  });

  test('1x1 zeros', () => {
    expect(matrixUtils.zeros2d(1, 1)).toEqual([[0]]);
  });

  test('2x2 zeros', () => {
    expect(matrixUtils.zeros2d(2, 2)).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });
});

describe('fixRoundOffFPErrors', () => {
  test('empty input', () => {
    expect(matrixUtils.fixRoundOffErrors([])).toEqual([]);
  });

  test('single input', () => {
    expect(matrixUtils.fixRoundOffErrors([0.1 + 0.2])).toEqual([0.3]);
  });

  test('double input', () => {
    expect(matrixUtils.fixRoundOffErrors([0.1 + 0.2, 0.020000000000000004])).toEqual([0.3, 0.02]);
  });
});
