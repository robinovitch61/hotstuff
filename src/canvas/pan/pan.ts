export {};

// types
type Point = {
  x: number;
  y: number;
};

// helpers
const diffPoints = (p1: Point, p2: Point) => {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
};

const addPoints = (p1: Point, p2: Point) => {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
};

function scalePoint(p1: Point, scale: number): Point {
  return { x: p1.x / scale, y: p1.y / scale };
}

// constants
const ORIGIN = Object.freeze({ x: 0, y: 0 });
const SQUARE_SIZE = 20;

// dom
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const debugDiv = document.getElementById("debug") as HTMLDivElement;

// "props"
const initialScale = 0.75;
const initialOffset = { x: 10, y: 20 };
const scale = initialScale;

// "state"
let mousePos = ORIGIN;
let lastMousePos = ORIGIN;
let offset = initialOffset;

function draw() {
  window.requestAnimationFrame(draw);

  // clear canvas
  context.canvas.width = context.canvas.width;

  // transform coordinates
  context.scale(scale, scale);
  context.translate(offset.x, offset.y);

  // draw
  context.fillRect(
    250 + -SQUARE_SIZE / 2,
    250 + -SQUARE_SIZE / 2,
    SQUARE_SIZE,
    SQUARE_SIZE
  );

  // debugging
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 50);
  context.moveTo(0, 0);
  context.lineTo(50, 0);
  context.stroke();
  debugDiv.innerText = `mouse: ${JSON.stringify(mousePos)}
    offset: ${JSON.stringify(offset)}
  `;
}

// track mouse
function handleUpdateMouse(event: MouseEvent) {
  event.preventDefault();
  const viewportMousePos = { x: event.pageX, y: event.pageY };
  const boundingRect = canvas.getBoundingClientRect();
  const topLeftCanvasPos = { x: boundingRect.left, y: boundingRect.top };
  lastMousePos = mousePos;
  mousePos = diffPoints(viewportMousePos, topLeftCanvasPos);
}
document.addEventListener("mousemove", handleUpdateMouse);

// panning
const mouseMove = () => {
  const mouseDiff = scalePoint(diffPoints(mousePos, lastMousePos), scale);
  offset = addPoints(offset, mouseDiff);
};
const mouseUp = () => {
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp);
};
const startPan = () => {
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);
};
canvas.addEventListener("mousedown", startPan);

// repeatedly redraw
window.requestAnimationFrame(draw);
