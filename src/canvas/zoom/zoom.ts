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
const ORIGIN = Object.freeze({
  x: 0,
  y: 0,
});
const SQUARE_SIZE = 20;
const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
// const MAX_SCALE = 2.5;
// const MIN_SCALE = 1;
const MAX_SCALE = 3;
const MIN_SCALE = 0.5;

// dom
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const debugDiv = document.getElementById("debug") as HTMLDivElement;

// "props"
const initialScale = 1;
const initialOffset = {
  x: 0,
  y: 0,
};

// "state"
let mousePos = ORIGIN;
let offset = initialOffset;
let scale = initialScale;

function draw() {
  window.requestAnimationFrame(draw);

  // clear canvas
  context.canvas.width = context.canvas.width;

  // calculate stuff
  const scaledOffset = scalePoint(offset, scale);

  // transform coordinates and draw stuff, then restore transforms
  context.save();

  context.scale(scale, scale);
  context.translate(scaledOffset.x, scaledOffset.y);
  // context.translate(offset.x, offset.y);

  context.fillRect(
    -SQUARE_SIZE / 2,
    -SQUARE_SIZE / 2,
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

  debugDiv.innerText = `scale: ${scale}
    mouse: ${JSON.stringify(mousePos)}
    offset: ${JSON.stringify(offset)}
  `;

  context.restore();
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  // const zoom = event.deltaY < 0 ? 1.5 : -1.5;
  // const zoom = event.deltaY < 0 ? 0.1 : -0.1;
  const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
  const newScale = scale * zoom;
  if (MIN_SCALE > newScale || newScale > MAX_SCALE) {
    return;
  }

  // adjust the offset
  // offset = addPoints(offset, { x: 1, y: 1 });
  const lastMouse = scalePoint(diffPoints(mousePos, offset), scale);
  const newMouse = scalePoint(diffPoints(mousePos, offset), newScale);
  const mouseOffset = diffPoints(lastMouse, newMouse);
  offset = diffPoints(offset, mouseOffset);

  scale = newScale;
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
