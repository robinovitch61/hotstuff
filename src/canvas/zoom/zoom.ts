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

// constants
const ORIGIN = Object.freeze({
  x: 0,
  y: 0,
});
const SQUARE_SIZE = 20;
const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

// dom
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const mousePosDiv = document.getElementById("mousePos") as HTMLDivElement;

// "props"
const initialScale = 1;
const initialOffset = {
  x: 0,
  y: 0,
};

// "state"
let mousePos = ORIGIN;
const lastMousePos = ORIGIN;
const offset = initialOffset;
let scale = initialScale;

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
  mousePosDiv.innerText = JSON.stringify(mousePos);
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
  scale = scale * zoom;
}

function handleUpdateMouse(event: MouseEvent) {
  event.preventDefault();
  const viewportMousePos = { x: event.clientX, y: event.clientY };
  const boundingRect = canvas.getBoundingClientRect();
  const topLeftCanvasPos = {
    x: boundingRect.left,
    y: boundingRect.top,
  };
  mousePos = diffPoints(viewportMousePos, topLeftCanvasPos);
}

canvas.addEventListener("wheel", handleWheel);
canvas.addEventListener("mousemove", handleUpdateMouse);

window.requestAnimationFrame(draw);
