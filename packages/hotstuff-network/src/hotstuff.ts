import * as math from '../deps/math';
import { Matrix as MathMatrix } from '../deps/math';

type Matrix = MathMatrix;
type MatrixVals = number[] | number[][];

export const utils = {
  matrix: (values: MatrixVals): Matrix => math.matrix(values),

  add: (x: Matrix | number, y: Matrix | number) => {
    try {
      return math.add(x, y);
    } catch {
      throw Error(`Failed to add ${x} + ${y}`);
    }
  },

  sub: (x: Matrix | number, y: Matrix | number) => {
    try {
      return math.subtract(x, y);
    } catch {
      throw Error(`Failed to subtract ${x} - ${y}`);
    }
  },

  mult: (x: Matrix | number, y: Matrix | number) => {
    try {
      return math.multiply(x, y);
    } catch {
      throw Error(`Failed to multiply ${x} * ${y}`);
    }
  },

  divide: (x: Matrix | number, y: Matrix | number) => {
    try {
      return math.dotDivide(x, y);
    } catch {
      throw Error(`Failed to divide ${x} - ${y}`);
    }
  },
};
