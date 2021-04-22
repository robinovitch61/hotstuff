import { Point } from "../App";
import config from "../../config";

const { canvasHeightPerc, editorWidthPerc } = config;

export function rescaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  windowWidth: number,
  windowHeight: number
) {
  context.save();
  const { devicePixelRatio: ratio = 1 } = window;
  canvas.width = windowWidth * (1 - editorWidthPerc) * ratio;
  canvas.height = windowHeight * canvasHeightPerc * ratio;
  context.scale(ratio, ratio);
  context.restore();
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
