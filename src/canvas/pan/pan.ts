// types
type Point = {
  x: number;
  y: number;
};

// helpers
const diffPoints = (p1: Point, p2: Point) => {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
};
const addPoints = (p1: Point, p2: Point) => {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  };
};

// constants
const ORIGIN = Object.freeze({
  x: 0,
  y: 0
});
const SQUARE_SIZE = 20;

// dom
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (canvas === null) {
  throw Error("no canvas");
}
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

// "props"
const initialScale = 1;
const initialOffset = {
  x: 0,
  y: 0
};

// "state"
let mousePos = ORIGIN;
let offset = initialOffset;
let scale = initialScale;
let lastMousePos = ORIGIN;

function draw() {
  window.requestAnimationFrame(draw);

  // clear canvas
  context.canvas.width = context.canvas.width;

  // transform coordinates and draw stuff, then restore transforms
  context.save();

  context.scale(scale, scale);
  context.translate(
    (context.canvas.width / 2 + offset.x) / scale,
    (context.canvas.height / 2 + offset.y) / scale
  );
  context.fillRect(
    -SQUARE_SIZE / 2,
    -SQUARE_SIZE / 2,
    SQUARE_SIZE,
    SQUARE_SIZE
  );

  context.restore();
}

// panning
const mouseMove = (event: MouseEvent) => {
  mousePos = {
    x: event.pageX,
    y: event.pageY
  };
  const mouseDiff = diffPoints(mousePos, lastMousePos);
  lastMousePos = mousePos;
  offset = addPoints(offset, mouseDiff);
};

const mouseUp = () => {
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp);
};

const startPan = (event: MouseEvent) => {
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);
  lastMousePos = {
    x: event.pageX,
    y: event.pageY
  };
};
canvas.addEventListener("mousedown", startPan);

window.requestAnimationFrame(draw);
