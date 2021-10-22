import { diffPoints, makePoint, ORIGIN, Point, scalePoint } from "./pointUtils";
import config from "../../config";
import { AppNode } from "../../App";
import * as React from "react";
import { CanvasState } from "./Canvas";

const { activeNodeOutlineWidth: activeNodeStrokeWidth } = config;

function drawCircle(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  color: string
): void {
  context.save();
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.closePath();
  context.restore();
}

function drawCircleOutline(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  color: string
): void {
  context.save();
  context.beginPath();
  // inset
  context.arc(
    center.x,
    center.y,
    radius - activeNodeStrokeWidth / 2,
    0,
    2 * Math.PI
  );
  context.lineWidth = activeNodeStrokeWidth;
  context.strokeStyle = color;
  context.stroke();
  context.closePath();
  context.restore();
}

function getHashPattern(): HTMLCanvasElement {
  // ty https://stackoverflow.com/a/47288427/8438955
  const patternCanvas = document.createElement("canvas");
  const patternContext = patternCanvas.getContext("2d");
  if (patternContext) {
    const colour = "black";

    const CANVAS_SIDE_LENGTH = 10;
    const WIDTH = CANVAS_SIDE_LENGTH;
    const HEIGHT = CANVAS_SIDE_LENGTH;
    const DIVISIONS = 8;

    patternCanvas.width = WIDTH;
    patternCanvas.height = HEIGHT;
    patternContext.fillStyle = colour;

    // Top line
    patternContext.beginPath();
    patternContext.moveTo(0, HEIGHT * (1 / DIVISIONS));
    patternContext.lineTo(WIDTH * (1 / DIVISIONS), 0);
    patternContext.lineTo(0, 0);
    patternContext.lineTo(0, HEIGHT * (1 / DIVISIONS));
    patternContext.fill();

    // Middle line
    patternContext.beginPath();
    patternContext.moveTo(WIDTH, HEIGHT * (1 / DIVISIONS));
    patternContext.lineTo(WIDTH * (1 / DIVISIONS), HEIGHT);
    patternContext.lineTo(0, HEIGHT);
    patternContext.lineTo(0, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    patternContext.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), 0);
    patternContext.lineTo(WIDTH, 0);
    patternContext.lineTo(WIDTH, HEIGHT * (1 / DIVISIONS));
    patternContext.fill();

    // Bottom line
    patternContext.beginPath();
    patternContext.moveTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    patternContext.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), HEIGHT);
    patternContext.lineTo(WIDTH, HEIGHT);
    patternContext.lineTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    patternContext.fill();
  }
  return patternCanvas;
}

export function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  startOffset = 0,
  endOffset = 0
): void {
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
  context.moveTo(startOffset, 0);
  const adjLength = length - endOffset;
  context.lineTo(adjLength, 0);
  context.moveTo(adjLength - headLength, -headWidth);
  context.lineTo(adjLength, 0);
  context.lineTo(adjLength - headLength, headWidth);
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

export function drawNode(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  isActive: boolean,
  isBoundary: boolean
  // temperatureDegC: number, // determines color?
  // capacitanceJPerDegK: number // determines size?
): void {
  drawCircle(context, center, radius, "red");
  if (isActive) {
    drawCircleOutline(context, center, radius, "black");
  }
  if (isBoundary) {
    context.save();
    context.beginPath();
    const pattern = context.createPattern(getHashPattern(), "repeat");
    if (pattern) {
      context.fillStyle = pattern;
      context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
      context.restore();
    }
  }
}

export function drawConnection(
  context: CanvasRenderingContext2D,
  source: AppNode,
  target: AppNode
): void {
  drawArrow(
    context,
    source.center,
    target.center,
    "black",
    source.radius,
    target.radius
  );
}

export function intersectsCircle(
  point: Point,
  circleCenter: Point,
  radius: number
): boolean {
  const deltaX = point.x - circleCenter.x;
  const deltaY = point.y - circleCenter.y;
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

export function calculateCanvasMouse(
  event: React.MouseEvent | MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const viewportMousePos = { x: event.pageX, y: event.pageY };
  const boundingRect = canvas.getBoundingClientRect();
  const topLeftCanvasPos = { x: boundingRect.left, y: boundingRect.top };
  return diffPoints(viewportMousePos, topLeftCanvasPos);
}

function canvasMouseToNodeCoords(
  mouse: Point,
  offset: Point,
  scale: number
): Point {
  return diffPoints(scalePoint(mouse, scale), offset);
}

export function mouseToNodeCoords(
  event: React.MouseEvent | MouseEvent,
  canvasState: CanvasState
): Point {
  if (canvasState.context) {
    const canvasMouse = calculateCanvasMouse(event, canvasState.context.canvas);
    return canvasMouseToNodeCoords(
      canvasMouse,
      canvasState.offset,
      canvasState.scale
    );
  } else {
    return ORIGIN;
  }
}
