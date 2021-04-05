import { matrixUtils } from '../matrixUtils';

describe('add', () => {
  test('1x1 addition', () => {
    expect(matrixUtils.add([1], [1])).toEqual([2]);
  });

  test('2x1 addition', () => {
    const first = [[1], [3]];
    const second = [[2], [4]];
    const sum = [[3], [7]];
    expect(matrixUtils.add(first, second)).toEqual(sum);
  });

  test('2x2 addition', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const second = [
      [2, 3],
      [4, 5],
    ];
    const sum = [
      [3, 5],
      [7, 9],
    ];
    expect(matrixUtils.add(first, second)).toEqual(sum);
  });
});

describe('addScalar', () => {
  test('1x1 scalar addition', () => {
    expect(matrixUtils.addScalar([1], 1)).toEqual([2]);
  });

  test('2x1 scalar addition', () => {
    const first = [[2], [4]];
    const second = 2;
    const sum = [[4], [6]];
    expect(matrixUtils.addScalar(first, second)).toEqual(sum);
  });

  test('2x2 scalar addition', () => {
    const first = [
      [2, 3],
      [4, 5],
    ];
    const second = 2;
    const sum = [
      [4, 5],
      [6, 7],
    ];
    expect(matrixUtils.addScalar(first, second)).toEqual(sum);
  });
});

describe('size', () => {
  test('empty input', () => {
    expect(matrixUtils.size([[]])).toEqual({ height: 0, width: 0 });
  });

  test('1x1 input', () => {
    expect(matrixUtils.size([[1]])).toEqual({ height: 1, width: 1 });
  });

  test('2x1 input', () => {
    expect(matrixUtils.size([[1], [2]])).toEqual({ height: 2, width: 1 });
  });

  test('2x2 input', () => {
    expect(
      matrixUtils.size([
        [1, 2],
        [3, 4],
      ]),
    ).toEqual({ height: 2, width: 2 });
  });
});

describe('mult', () => {
  test('1x1 multiplication', () => {
    expect(matrixUtils.mult([1], [2])).toEqual([2]);
  });

  test('2x2 * 2x1 multiplication', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const second = [[1], [2]];
    const product = [[5], [11]];
    expect(matrixUtils.mult(first, second)).toEqual(product);
  });

  test('2x2 * 1x2 multiplication throws', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const second = [1, 2];
    expect(() => matrixUtils.mult(first, second)).toThrow();
  });

  test('weirdo matrix throws', () => {
    const first = [[1, 2], [3]];
    const second = [[1], [2]];
    expect(() => matrixUtils.mult(first, second)).toThrow();
  });

  test('2x2 multiplication', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const product = [
      [7, 10],
      [15, 22],
    ];
    expect(matrixUtils.mult(first, first)).toEqual(product);
  });
});

describe('multScalar', () => {
  test('1x1 scalar multiplication', () => {
    expect(matrixUtils.multScalar([1], 2)).toEqual([2]);
  });

  test('2x1 scalar multiplication', () => {
    const first = [[1], [3]];
    const product = [[2], [6]];
    expect(matrixUtils.multScalar(first, 2)).toEqual(product);
  });

  test('2x2 scalar multiplication', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const product = [
      [2, 4],
      [6, 8],
    ];
    expect(matrixUtils.multScalar(first, 2)).toEqual(product);
  });
});

describe('pow', () => {
  test('1x1 pow', () => {
    expect(matrixUtils.pow([2], 2)).toEqual([4]);
  });

  test('2x1 pow', () => {
    const first = [[1], [3]];
    const product = [[1], [9]];
    expect(matrixUtils.pow(first, 2)).toEqual(product);
  });

  test('2x2 pow', () => {
    const first = [
      [1, 2],
      [3, 4],
    ];
    const product = [
      [1, 4],
      [9, 16],
    ];
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

describe('makeVertical', () => {
  test('empty input', () => {
    expect(matrixUtils.makeVertical([])).toEqual([[]]);
  });

  test('single input', () => {
    expect(matrixUtils.makeVertical([1])).toEqual([[1]]);
  });

  test('multiple inputs', () => {
    expect(matrixUtils.makeVertical([1, 2])).toEqual([[1], [2]]);
  });
});

describe('flatten', () => {
  test('empty input', () => {
    expect(matrixUtils.flatten([[]])).toEqual([]);
  });

  test('single input', () => {
    expect(matrixUtils.flatten([[1]])).toEqual([1]);
  });

  test('multiple inputs', () => {
    expect(matrixUtils.flatten([[1], [2]])).toEqual([1, 2]);
  });
});
