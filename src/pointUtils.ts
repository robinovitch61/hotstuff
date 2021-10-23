export type Point = {
  x: number;
  y: number;
};

export const ORIGIN = Object.freeze({ x: 0, y: 0 });

export function makePoint(x: number, y: number): Point {
  return { x, y };
}

export function addPoints(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function diffPoints(p1: Point, p2: Point): Point {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

export function scalePoint(p1: Point, scale: number): Point {
  return { x: p1.x / scale, y: p1.y / scale };
}

// export function distanceBetweenPoints(p1: Point, p2: Point): number {
//   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
// }
