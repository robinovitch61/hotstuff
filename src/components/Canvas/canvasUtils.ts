import {
  addPoints,
  diffPoints,
  makePoint,
  Point,
  scalePoint,
} from "./pointUtils";
import config from "../../config";

const { canvasHeightPerc, editorWidthPerc, activeNodeStrokeWidth } = config;

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
  color: string,
  isActive: boolean
) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  if (isActive) {
    // inset
    context.arc(x, y, radius - activeNodeStrokeWidth / 2, 0, 2 * Math.PI);
    context.lineWidth = activeNodeStrokeWidth;
    context.stroke();
  }
  context.restore();
}

export function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string
) {
  context.save();
  context.beginPath();
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
  context.closePath();
  context.restore();
}

export function drawClearBox(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string
): void {
  context.save();
  context.beginPath();
  context.fillStyle = color;
  context.globalAlpha = 0.2;
  context.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
  context.closePath();

  // outline
  context.beginPath();
  context.strokeStyle = color;
  context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
  context.stroke();
  context.closePath();

  context.restore();
}

export function drawConnection(
  context: CanvasRenderingContext2D,
  source: Point,
  target: Point
): void {
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

export function isInsideBox(
  startBox: Point,
  endBox: Point,
  point: Point
): boolean {
  const [topLeft, bottomRight] =
    startBox.x < endBox.x && startBox.y < endBox.y
      ? [startBox, endBox]
      : [endBox, startBox];

  const [bottomLeft, topRight] =
    startBox.x < endBox.x && startBox.y > endBox.y
      ? [startBox, endBox]
      : [endBox, startBox];

  return (
    (topLeft.x <= point.x &&
      point.x <= bottomRight.x &&
      topLeft.y <= point.y &&
      point.y <= bottomRight.y) ||
    (bottomLeft.x <= point.x &&
      point.x <= topRight.x &&
      topRight.y <= point.y &&
      point.y <= bottomLeft.y)
  );
}

export function mouseToNodeCoords(
  mouse: Point,
  offset: Point,
  viewportTopLeft: Point,
  scale: number
): Point {
  return addPoints(
    scalePoint(makePoint(mouse.x, mouse.y), scale),
    viewportTopLeft
  );
}
