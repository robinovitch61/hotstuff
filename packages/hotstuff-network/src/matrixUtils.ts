import * as math from '../deps/math';
import { Matrix as MathMatrix } from '../deps/math';

type Matrix = number[] | number[][];
type Size = {
  height: number;
  width: number;
};

function add(x: Matrix, y: Matrix): Matrix {
  try {
    const res = math.add(math.matrix(x), math.matrix(y)) as MathMatrix;
    return res.toArray();
  } catch {
    throw Error(`Failed to add ${x} + ${y}`);
  }
}

// TODO: MAKE GENERIC TYPED SO DON'T HAVE TO CAST RESULT
function addScalar(x: Matrix, y: number): Matrix {
  try {
    const res = math.add(math.matrix(x), y) as MathMatrix;
    return res.toArray();
  } catch {
    throw Error(`Failed to add ${x} + ${y}`);
  }
}

function size(x: Matrix): Size {
  const isOneDim = typeof x[0] === 'number';
  if (isOneDim) {
    return {
      height: 1,
      width: x.length,
    };
  } else {
    const twoD = x as number[][];
    if (twoD[0].length === 0) {
      return {
        height: 0,
        width: 0,
      };
    }
    const width = twoD[0].length;
    twoD.forEach((row) => {
      if (row.length !== width) {
        throw Error(`Not all rows are equal length in ${x}`);
      }
    });
    return {
      height: x.length,
      width: width,
    };
  }
}

function mult(x: Matrix, y: Matrix): Matrix {
  try {
    if (size(x).width !== size(y).height) {
      throw Error(`Dimensional mismatch multiplying ${x} * ${y}`);
    }
    const res = math.multiply(math.matrix(x), math.matrix(y)) as MathMatrix;
    // math.js returns scalar if 1x1s here
    if (typeof res === 'number') {
      return [res];
    }
    return res.toArray();
  } catch {
    throw Error(`Failed to multiply ${x} * ${y}`);
  }
}

function multScalar(x: Matrix, y: number): Matrix {
  try {
    const res = math.multiply(math.matrix(x), y) as MathMatrix;
    // math.js returns scalar if 1x1s here
    if (typeof res === 'number') {
      return [res];
    }
    return res.toArray();
  } catch {
    throw Error(`Failed to multiply ${x} * ${y}`);
  }
}

function pow(x: Matrix, y: number): Matrix {
  try {
    const res = math.dotPow(math.matrix(x), y) as MathMatrix;
    return res.toArray();
  } catch {
    throw Error(`Failed to put ${x} to the power of ${y}`);
  }
}

function zeros2d(width: number, height: number): number[][] {
  try {
    if (width === 0 && height === 0) {
      return [[]];
    }
    const res = math.zeros(height, width) as MathMatrix;
    return res.toArray() as number[][];
  } catch {
    throw Error(`Failed to create ${height}x${width} 2d matrix`);
  }
}

function makeVertical(x: number[]): number[][] {
  if (x.length === 0) {
    return [[]];
  }
  return x.map((val) => [val]);
}

function flatten(x: number[][]): number[] {
  const xSize = size(x);
  if (xSize.width === 0 && xSize.height === 0) {
    return [];
  } else if (xSize.width !== 1) {
    throw Error('Can only flatten N x 1 matrix');
  }
  return x.map((val) => val[0]);
}

export const matrixUtils = {
  add,
  addScalar,
  size,
  mult,
  multScalar,
  pow,
  zeros2d,
  makeVertical,
  flatten,
};
