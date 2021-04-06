import * as math from '../deps/math';
import { Matrix as MathMatrix } from '../deps/math';

function add(x: number[], y: number[]): number[] {
  try {
    const res = math.add(math.matrix(x), math.matrix(y)) as MathMatrix;
    return res.toArray() as number[];
  } catch {
    throw Error(`Failed to add ${x} + ${y}`);
  }
}

function addScalar(x: number[], y: number): number[] {
  try {
    const res = math.add(math.matrix(x), y) as MathMatrix;
    return res.toArray() as number[];
  } catch {
    throw Error(`Failed to add ${x} + ${y}`);
  }
}

function mult(x: number[][], y: number[]): number[] {
  try {
    const width = x[0].length;
    x.forEach((row) => {
      if (row.length !== width) {
        throw Error(`Not all rows are equal length in ${x}`);
      }
    });
    if (width === 0) {
      return [];
    } else if (width !== y.length) {
      throw Error(`Dimensional mismatch multiplying ${x} * ${y}`);
    }
    const res = math.multiply(math.matrix(x), math.matrix(y)) as MathMatrix;
    // math.js returns scalar if 1x1s here
    if (typeof res === 'number') {
      return [res];
    }
    return res.toArray() as number[];
  } catch {
    throw Error(`Failed to multiply ${x} * ${y}`);
  }
}

function multScalar(x: number[], y: number): number[] {
  try {
    const res = math.multiply(math.matrix(x), y) as MathMatrix;
    // math.js returns scalar if 1x1s here
    if (typeof res === 'number') {
      return [res];
    }
    return res.toArray() as number[];
  } catch {
    throw Error(`Failed to multiply ${x} * ${y}`);
  }
}

function pow(x: number[], y: number): number[] {
  try {
    const res = math.dotPow(math.matrix(x), y) as MathMatrix;
    return res.toArray() as number[];
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

export const matrixUtils = {
  add,
  addScalar,
  mult,
  multScalar,
  pow,
  zeros2d,
};
