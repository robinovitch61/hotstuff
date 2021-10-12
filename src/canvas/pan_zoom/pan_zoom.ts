export {};

// types
type Point = {
  x: number;
  y: number;
};

// helpers
function diffPoints(p1: Point, p2: Point): Point {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}
function addPoints(p1: Point, p2: Point): Point {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}
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
let mousePos = ORIGIN;
let offset = initialOffset;
const scale = initialScale;
let lastMousePos = ORIGIN;
const lastOffset = ORIGIN;
const viewportTopLeft = ORIGIN;

// // pan when offset or scale changes
// useLayoutEffect(() => {
//   if (context && lastOffsetRef.current) {
//     const offsetDiff = scalePoint(
//       diffPoints(offset, lastOffsetRef.current),
//       scale
//     );
//     context.translate(offsetDiff.x, offsetDiff.y);
//     setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
//     isResetRef.current = false;
//   }
// }, [context, offset, scale]);

// add event listener on canvas for mouse position
// useEffect(() => {
//   const canvasElem = canvasRef.current;
//   if (canvasElem === null) {
//     return;
//   }
//
//   function handleUpdateMouse(event: MouseEvent) {
//     event.preventDefault();
//     if (canvasRef.current) {
//       const viewportMousePos = { x: event.clientX, y: event.clientY };
//       const topLeftCanvasPos = {
//         x: canvasRef.current.offsetLeft,
//         y: canvasRef.current.offsetTop,
//       };
//       setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
//     }
//   }
//
//   canvasElem.addEventListener("mousemove", handleUpdateMouse);
//   canvasElem.addEventListener("wheel", handleUpdateMouse);
//   return () => {
//     canvasElem.removeEventListener("mousemove", handleUpdateMouse);
//     canvasElem.removeEventListener("wheel", handleUpdateMouse);
//   };
// }, []);
//
// // add event listener on canvas for zoom
// useEffect(() => {
//   const canvasElem = canvasRef.current;
//   if (canvasElem === null) {
//     return;
//   }
//
//   // this is tricky. Update the viewport's "origin" such that
//   // the mouse doesn't move during scale - the 'zoom point' of the mouse
//   // before and after zoom is relatively the same position on the viewport
//   function handleWheel(event: WheelEvent) {
//     event.preventDefault();
//     if (context) {
//       const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
//       const viewportTopLeftDelta = {
//         x: (mousePos.x / scale) * (1 - 1 / zoom),
//         y: (mousePos.y / scale) * (1 - 1 / zoom),
//       };
//       const newViewportTopLeft = addPoints(
//         viewportTopLeft,
//         viewportTopLeftDelta
//       );
//
//       context.translate(viewportTopLeft.x, viewportTopLeft.y);
//       context.scale(zoom, zoom);
//       context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);
//
//       setViewportTopLeft(newViewportTopLeft);
//       setScale(scale * zoom);
//       isResetRef.current = false;
//     }
//   }
//
//   canvasElem.addEventListener("wheel", handleWheel);
//   return () => canvasElem.removeEventListener("wheel", handleWheel);
// }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);

function draw() {
  window.requestAnimationFrame(draw);

  // clear canvas
  context.canvas.width = context.canvas.width;

  // transform coordinates and draw stuff, then restore transforms
  context.save();

  // const offsetDiff = scalePoint(
  //   diffPoints(offset, lastOffsetRef.current),
  //   scale
  // );
  // context.translate(offsetDiff.x, offsetDiff.y);
  // setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));

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
    y: event.pageY,
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
    y: event.pageY,
  };
};
canvas.addEventListener("mousedown", startPan);

window.requestAnimationFrame(draw);
