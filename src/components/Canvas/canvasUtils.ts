import { diffPoints, ORIGIN, Point, scalePoint } from "../../utils/pointUtils";
import config from "../../config";
import { Direction } from "../../App";
import * as React from "react";
import { CanvasState } from "./Canvas";
import { scaleDiverging } from "d3-scale";
import { HSConnectionKind } from "hotstuff-network";

const { activeNodeOutlineWidthPx, minRadiusPx, maxRadiusPx } = config;
export const DEFAULT_RADIUS = Math.floor((minRadiusPx + maxRadiusPx) / 2);

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
    radius - activeNodeOutlineWidthPx / 2,
    0,
    2 * Math.PI
  );
  context.lineWidth = activeNodeOutlineWidthPx;
  context.strokeStyle = color;
  context.stroke();
  context.closePath();
  context.restore();
}

function drawHashPattern(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number
) {
  context.save();
  context.lineWidth = 2;
  context.fillStyle = "#FFFFFF";

  const delta = 4.5;
  const buffer = 1;
  const circle = 2;

  // save the canvas above, now transform it for ease of drawing
  context.translate(center.x, center.y);
  context.rotate(Math.PI / 4);

  // draw horizontal line
  context.beginPath();
  context.moveTo(-radius, 0);
  context.lineTo(radius, 0);
  context.stroke();

  // draw smaller horizontal lines offset vertically from center
  let h = 0; // vertical distance from center
  while (h + delta < radius) {
    h = h + delta;
    const newRadius = radius * Math.sin(Math.acos(h / radius));
    context.moveTo(-newRadius - buffer, h);
    context.lineTo(newRadius + buffer, h);
    context.stroke();
    context.moveTo(-newRadius - buffer, -h);
    context.lineTo(newRadius + buffer, -h);
    context.stroke();
  }
  context.closePath();

  // clip off the extra bits around the circle
  context.beginPath();
  context.arc(0, 0, radius + circle, 0, Math.PI * 2, false);
  context.arc(0, 0, radius, 0, Math.PI * 2, true);
  context.fill();

  context.restore();
}

function drawNodeName(
  context: CanvasRenderingContext2D,
  name: string,
  center: Point,
  radius: number,
  textDirection: Direction
) {
  const bufferText = 2;
  context.save();
  context.font = "14px Helvetica";
  const textMetrics = context.measureText(name);
  const width = textMetrics.width;
  context.translate(center.x, center.y);
  if (textDirection === "D") {
    context.fillText(
      name,
      -width / 2,
      textMetrics.actualBoundingBoxAscent + radius + bufferText
    );
  } else if (textDirection === "R") {
    context.fillText(
      name,
      radius + bufferText,
      textMetrics.actualBoundingBoxAscent / 2
    );
  } else if (textDirection === "U") {
    context.fillText(
      name,
      -width / 2,
      -(textMetrics.actualBoundingBoxDescent + radius + bufferText)
    );
  } else {
    context.fillText(
      name,
      -(width + radius + bufferText),
      textMetrics.actualBoundingBoxAscent / 2
    );
  }
  context.restore();
}

export function drawNode(
  context: CanvasRenderingContext2D,
  name: string,
  center: Point,
  radius: number,
  color: string,
  isActive: boolean,
  isBoundary: boolean,
  textDirection: Direction
): void {
  drawCircle(context, center, radius, color);
  if (isActive) {
    drawCircleOutline(context, center, radius, "black");
  }
  if (isBoundary) {
    drawHashPattern(context, center, radius);
  }
  drawNodeName(context, name, center, radius, textDirection);
}

export function drawBidirectionalArrow(
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
  const arrowGap = 0;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);
  const adjLength = length - endOffset;

  context.translate(start.x, start.y);
  context.rotate(angle);

  context.beginPath();
  context.moveTo(startOffset, arrowGap);
  context.lineTo(adjLength, arrowGap);
  context.moveTo(adjLength - headLength, headWidth + arrowGap);
  context.lineTo(adjLength, arrowGap);
  context.lineTo(adjLength - headLength, -(headWidth - arrowGap));

  context.moveTo(adjLength, -arrowGap);
  context.lineTo(startOffset, -arrowGap);
  context.moveTo(startOffset + headLength, -(headWidth + arrowGap));
  context.lineTo(startOffset, -arrowGap);
  context.lineTo(startOffset + headLength, headWidth - arrowGap);

  context.stroke();
  context.closePath();
  context.restore();
}

export function drawUnidirectionalArrow(
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
  const adjLength = length - endOffset;

  context.translate(start.x, start.y);
  context.rotate(angle);

  context.beginPath();
  context.moveTo(startOffset, 0);
  context.lineTo(adjLength, 0);
  context.moveTo(adjLength - headLength, -headWidth);
  context.lineTo(adjLength, 0);
  context.lineTo(adjLength - headLength, headWidth);
  context.stroke();
  context.closePath();
  context.restore();
}

export function drawArrowWithoutHead(
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
  firstNodeCenter: Point,
  firstNodeRadius: number,
  secondNodeCenter: Point,
  secondNodeRadius: number,
  kind: HSConnectionKind
): void {
  if (["cond", "conv"].includes(kind)) {
    drawBidirectionalArrow(
      context,
      firstNodeCenter,
      secondNodeCenter,
      "black",
      firstNodeRadius,
      secondNodeRadius
    );
  } else {
    drawUnidirectionalArrow(
      context,
      firstNodeCenter,
      secondNodeCenter,
      "black",
      firstNodeRadius,
      secondNodeRadius
    );
  }
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

export function calculateMousePositionOnElement(
  event: React.MouseEvent | MouseEvent,
  element: HTMLElement
): Point {
  const viewportMousePos = { x: event.pageX, y: event.pageY };
  const boundingRect = element.getBoundingClientRect();
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
    const canvasMouse = calculateMousePositionOnElement(
      event,
      canvasState.context.canvas
    );
    return canvasMouseToNodeCoords(
      canvasMouse,
      canvasState.canvasViewState.offset,
      canvasState.canvasViewState.scale
    );
  } else {
    return ORIGIN;
  }
}

export function rotatedDirection(direction: Direction): Direction {
  // assume rotate counter-clockwise
  if (direction === "D") {
    return "R";
  } else if (direction === "R") {
    return "U";
  } else if (direction === "U") {
    return "L";
  } else {
    return "D";
  }
}

export function getCanvasCenter(
  canvasWidth: number,
  canvasHeight: number,
  offset: Point,
  scale: number
): Point {
  const topLeftPoint = offset;
  const distanceToCenter = scalePoint(
    { x: canvasWidth, y: canvasHeight },
    2 * scale
  );
  return diffPoints(distanceToCenter, topLeftPoint);
}

export function determineRadius(
  capacitance: number,
  allCapacitances: number[]
): number {
  const min = Math.min(...allCapacitances);
  const max = Math.max(...allCapacitances);
  // cap = min -> minRadius
  // cap = max -> maxRadius
  // radius = (cap - min) / (max - min) * 20 + 10
  if (min === max) {
    return DEFAULT_RADIUS;
  }
  return (
    ((capacitance - min) / (max - min)) * (maxRadiusPx - minRadiusPx) +
    minRadiusPx
  );
}

export function determineColor(
  temperature: number,
  allTemperatures: number[]
): string {
  const minTemp = Math.min(...allTemperatures);
  const maxTemp = Math.max(...allTemperatures);
  const range = maxTemp - minTemp;
  const test = scaleDiverging<string>()
    .domain([minTemp - range / 3, (minTemp + maxTemp) / 2, maxTemp + range / 3])
    .range(["blue", "#ababab", "red"]);
  return test(temperature);
}
