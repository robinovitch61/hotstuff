import * as math from '../deps/math';
import { Matrix as MathMatrix } from '../deps/math';

type Matrix = number[] | number[][];

export const matrixUtils = {
  add: (x: Matrix, y: Matrix): Matrix => {
    try {
      const res = math.add(math.matrix(x), math.matrix(y)) as MathMatrix;
      return res.toArray();
    } catch {
      throw Error(`Failed to add ${x} + ${y}`);
    }
  },

  sub: (x: Matrix, y: Matrix) => {
    try {
      const res = math.subtract(math.matrix(x), math.matrix(y)) as MathMatrix;
      return res.toArray();
    } catch {
      throw Error(`Failed to subtract ${x} - ${y}`);
    }
  },

  mult: (x: Matrix, y: Matrix) => {
    try {
      const res = math.multiply(math.matrix(x), math.matrix(y)) as MathMatrix;
      // math.js returns scalar if 1x1s here
      if (typeof res === 'number') {
        return [res];
      }
      return res.toArray();
    } catch {
      throw Error(`Failed to multiply ${x} * ${y}`);
    }
  },

  divide: (x: Matrix, y: Matrix) => {
    try {
      const res = math.dotDivide(math.matrix(x), math.matrix(y)) as MathMatrix;
      return res.toArray();
    } catch {
      throw Error(`Failed to divide ${x} - ${y}`);
    }
  },

  zeros2d: (width: number, height: number): number[][] => {
    try {
      if (width === 0 && height === 0) {
        return [[]];
      }
      const res = math.zeros(height, width) as MathMatrix;
      return res.toArray() as number[][];
    } catch {
      throw Error(`Failed to create ${height}x${width} 2d matrix`);
    }
  },
};
