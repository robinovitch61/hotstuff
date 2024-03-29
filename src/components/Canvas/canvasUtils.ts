import { diffPoints, ORIGIN, Point, scalePoint } from "../../utils/pointUtils";
import config from "../../config";
import { AppConnection, AppNode, Direction } from "../../App";
import * as React from "react";
import { CanvasState } from "./Canvas";
import { scaleDiverging } from "d3-scale";
import { HSConnectionKind } from "hotstuff-network";
import {
  decrementConnectionCount,
  getConnectionKey,
  getConnectionsToCounts,
} from "../../utils/nodeConnectionUtils";

const {
  activeNodeOutlineWidthPx,
  minRadiusPx,
  maxRadiusPx,
  minLineThicknessPx,
  maxLineThicknessPx,
} = config;
export const DEFAULT_RADIUS = Math.floor((minRadiusPx + maxRadiusPx) / 2);
export const DEFAULT_LINE_THICKNESS = Math.floor(
  (minLineThicknessPx + maxLineThicknessPx) / 2
);

function scientificNotation(num: number, precision: number): string {
  return num.toExponential(precision).replace("+", "");
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawCircle(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  color: string
): void {
  context.save();

  // draw node itself
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.closePath();

  context.restore();
}

function drawPowerGen(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  powerGen: number
): void {
  context.save();
  const genString =
    (powerGen >= 1000 || powerGen <= -1000
      ? scientificNotation(powerGen, 1)
      : powerGen.toString()) + "W";
  let width;
  let fontPx = 12;
  let textMetrics;
  do {
    context.font = `${fontPx}px Helvetica`;
    textMetrics = context.measureText(genString);
    width = textMetrics.width;
    fontPx--;
  } while (width + 10 > radius * 2);
  const height = textMetrics.actualBoundingBoxAscent;

  context.fillStyle = "black";
  roundRect(
    context,
    center.x - width / 2 - 1,
    center.y - height,
    width + 2,
    height * 2,
    height / 4
  );
  context.fill();
  context.fillStyle = "white";
  context.fillText(genString, center.x - width / 2, center.y + height / 2);
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
  textDirection: Direction,
  powerGen: number
): void {
  drawCircle(context, center, radius, color);
  if (isActive) {
    drawCircleOutline(context, center, radius, "black");
  }
  if (isBoundary) {
    drawHashPattern(context, center, radius);
  }
  if (powerGen !== 0) {
    drawPowerGen(context, center, radius, powerGen);
  }
  drawNodeName(context, name, center, radius, textDirection);
}

export function drawNodes(
  context: CanvasRenderingContext2D,
  appNodes: AppNode[]
): void {
  appNodes.forEach((node) => {
    const nodeRadius = determineRadius(
      node.capacitanceJPerDegK,
      appNodes.map((node) => node.capacitanceJPerDegK)
    );
    const nodeColor = determineColor(
      node.temperatureDegC,
      appNodes.map((node) => node.temperatureDegC)
    );
    drawNode(
      context,
      node.name,
      node.center,
      nodeRadius,
      nodeColor,
      node.isActive,
      node.isBoundary,
      node.textDirection,
      node.powerGenW
    );
  });
}

function drawLineBetween(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  lineThicknessPx: number,
  imgForConnectionKind: HTMLImageElement,
  startOffset = 0,
  endOffset = 0,
  alreadyDrawn = 0,
  leftToDraw = 1
): void {
  // this function assumes there will never be more than 2 left to draw (can't have conduction + convection + radiation)
  if (leftToDraw === 0) {
    return;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);
  const adjLength = length - endOffset;

  // draw connecting line
  if (alreadyDrawn === 0) {
    context.save();

    context.strokeStyle = color;
    context.lineWidth = lineThicknessPx;

    context.translate(start.x, start.y);
    context.rotate(angle);

    context.beginPath();
    context.moveTo(startOffset, 0);
    context.lineTo(adjLength, 0);
    context.moveTo(adjLength, -0);
    context.lineTo(startOffset, -0);
    context.stroke();
    context.closePath();

    context.restore();
  }

  // draw image for connection kind
  const imageSize = 20;
  const buffer = 2;
  const offset =
    alreadyDrawn === 0 && leftToDraw === 2
      ? -(imageSize / 2 + buffer)
      : alreadyDrawn === 1 && leftToDraw === 1
      ? imageSize / 2 + buffer
      : 0;

  context.save();
  context.fillStyle = "white";

  context.translate(start.x, start.y);
  context.rotate(angle);
  context.translate(length / 2 + offset, 0);
  context.beginPath();
  context.arc(0, 0, imageSize / 2, 0, Math.PI * 2);
  context.fill();
  context.closePath();

  context.rotate(-angle);
  context.translate(-imageSize / 2, imageSize / 2);
  context.drawImage(imgForConnectionKind, 0, -imageSize, imageSize, imageSize);

  context.restore();
}

export function drawConnections(
  context: CanvasRenderingContext2D,
  appNodes: AppNode[],
  appConnections: AppConnection[],
  connectionKindImageMap: Map<HSConnectionKind, HTMLImageElement>
): void {
  const connectionToCount = getConnectionsToCounts(appConnections);
  const leftToDrawConnectionCount = new Map(connectionToCount);
  const allResistances = appConnections.map((conn) => conn.resistanceDegKPerW);
  appConnections.map((conn) => {
    const { firstNode, secondNode, kind } = conn;
    const imgForConnectionKind = connectionKindImageMap.get(kind);
    if (imgForConnectionKind) {
      const firstNodeAppNode = appNodes.find(
        (node) => node.id === firstNode.id
      );
      const secondNodeAppNode = appNodes.find(
        (node) => node.id === secondNode.id
      );
      if (firstNodeAppNode && secondNodeAppNode) {
        const firstNodeRadius = determineRadius(
          firstNodeAppNode.capacitanceJPerDegK,
          appNodes.map((node) => node.capacitanceJPerDegK)
        );
        const secondNodeRadius = determineRadius(
          secondNodeAppNode.capacitanceJPerDegK,
          appNodes.map((node) => node.capacitanceJPerDegK)
        );

        const key = getConnectionKey(conn);
        const leftToDraw = leftToDrawConnectionCount.get(key) ?? 0;
        const alreadyDrawn = (connectionToCount.get(key) ?? 0) - leftToDraw;
        drawConnection(
          context,
          firstNodeAppNode.center,
          firstNodeRadius,
          secondNodeAppNode.center,
          secondNodeRadius,
          determineLineThickness(conn.resistanceDegKPerW, allResistances),
          imgForConnectionKind,
          alreadyDrawn,
          leftToDraw
        );
        decrementConnectionCount(leftToDrawConnectionCount, conn);
      }
    }
  });
}

export function drawLine(
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

function drawConnection(
  context: CanvasRenderingContext2D,
  firstNodeCenter: Point,
  firstNodeRadius: number,
  secondNodeCenter: Point,
  secondNodeRadius: number,
  lineThicknessPx: number,
  imgForConnectionKind: HTMLImageElement,
  alreadyDrawn: number,
  leftToDraw: number
): void {
  drawLineBetween(
    context,
    firstNodeCenter,
    secondNodeCenter,
    "black",
    lineThicknessPx,
    imgForConnectionKind,
    firstNodeRadius,
    secondNodeRadius,
    alreadyDrawn,
    leftToDraw
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
  if (min === max) {
    return DEFAULT_RADIUS;
  }
  // linear interpolation
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
  const colorScale = scaleDiverging<string>()
    .domain([minTemp - range / 3, (minTemp + maxTemp) / 2, maxTemp + range / 3])
    .range(["blue", "#ababab", "red"]);
  return colorScale(temperature);
}

export function determineLineThickness(
  resistance: number,
  allResistances: number[]
): number {
  const min = Math.min(...allResistances);
  const max = Math.max(...allResistances);
  if (min === max) {
    return DEFAULT_LINE_THICKNESS;
  }
  // linear interpolation
  return (
    ((resistance - min) / (max - min)) *
      (maxLineThicknessPx - minLineThicknessPx) +
    minLineThicknessPx
  );
}
