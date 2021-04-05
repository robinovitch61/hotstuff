import { matrixUtils } from '../matrixUtils';

describe('add', () => {
  test('1x1 addition', () => {
    expect(matrixUtils.add([1], [1])).toEqual([2]);
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

  // TODO: Implement some form of broadcasting?
});

describe('sub', () => {
  test('1x1 subtraction', () => {
    expect(matrixUtils.sub([1], [1])).toEqual([0]);
  });

  test('2x2 subtraction', () => {
    const first = [
      [2, 3],
      [4, 5],
    ];
    const second = [
      [1, 2],
      [3, 4],
    ];
    const sum = [
      [1, 1],
      [1, 1],
    ];
    expect(matrixUtils.sub(first, second)).toEqual(sum);
  });
});

describe('mult', () => {
  test('1x1 multiplication', () => {
    expect(matrixUtils.mult([1], [2])).toEqual([2]);
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

describe('divide', () => {
  test('1x1 division', () => {
    expect(matrixUtils.divide([1], [2])).toEqual([0.5]);
  });

  test('2x2 division', () => {
    const first = [
      [4, 6],
      [9, 12],
    ];
    const second = [
      [1, 2],
      [3, 4],
    ];
    const quotient = [
      [4, 3],
      [3, 3],
    ];
    expect(matrixUtils.divide(first, second)).toEqual(quotient);
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
