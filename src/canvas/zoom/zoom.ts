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
if (canvas === null) {
  throw Error("no canvas");
}
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

// "props"
const initialScale = 1;
const initialOffset = {
  x: 0,
  y: 0,
};

// "state"
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
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
  scale = scale * zoom;
}

canvas.addEventListener("wheel", handleWheel);

window.requestAnimationFrame(draw);
