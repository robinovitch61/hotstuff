import { makePoint, Point } from "./pointUtils";
import config from "../../config";

const { canvasHeightPerc, editorWidthPerc } = config;

export function rescaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  const { devicePixelRatio: ratio = 1 } = window;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  context.scale(ratio, ratio);
}

export function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

export function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  const headLength = 9;
  const headWidth = 4;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);
  context.translate(start.x, start.y);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(length, 0);
  context.moveTo(length - headLength, -headWidth);
  context.lineTo(length, 0);
  context.lineTo(length - headLength, headWidth);
  context.stroke();
  context.restore();
}

export function drawConnection(
  context: CanvasRenderingContext2D,
  source: Point,
  target: Point
) {
  drawArrow(context, source, target, "black");
}

export function intersectsCircle(
  click: Point,
  circleCenter: Point,
  radius: number
): boolean {
  const deltaX = click.x - circleCenter.x;
  const deltaY = click.y - circleCenter.y;
  return Math.pow(deltaX, 2) + Math.pow(deltaY, 2) <= Math.pow(radius, 2);
}

// transforms clicked coordinates to what gets stored in node data
export function toNodeCoords(
  canvas: HTMLCanvasElement,
  point: Point,
  offset: Point,
  scale: number
) {
  const boundingRect = canvas.getBoundingClientRect();
  return makePoint(
    (point.x - boundingRect.left + offset.x) / scale,
    (point.y - boundingRect.top + offset.y) / scale
  );
}
