// helpers
function diffPoints(p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    };
}
function addPoints(p1, p2) {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
    };
}
function scalePoint(p1, scale) {
    return { x: p1.x / scale, y: p1.y / scale };
}
// constants
var ORIGIN = Object.freeze({
    x: 0,
    y: 0,
});
var SQUARE_SIZE = 20;
var ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
// dom
var canvas = document.getElementById("canvas");
if (canvas === null) {
    throw Error("no canvas");
}
var context = canvas.getContext("2d");
// "props"
var initialScale = 1;
var initialOffset = {
    x: 0,
    y: 0,
};
// "state"
var mousePos = ORIGIN;
var offset = initialOffset;
var scale = initialScale;
var lastMousePos = ORIGIN;
var lastOffset = ORIGIN;
var viewportTopLeft = ORIGIN;
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
    context.translate((context.canvas.width / 2 + offset.x) / scale, (context.canvas.height / 2 + offset.y) / scale);
    context.fillRect(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    context.restore();
}
// panning
var mouseMove = function (event) {
    mousePos = {
        x: event.pageX,
        y: event.pageY,
    };
    var mouseDiff = diffPoints(mousePos, lastMousePos);
    lastMousePos = mousePos;
    offset = addPoints(offset, mouseDiff);
};
var mouseUp = function () {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
};
var startPan = function (event) {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    lastMousePos = {
        x: event.pageX,
        y: event.pageY,
    };
};
canvas.addEventListener("mousedown", startPan);
window.requestAnimationFrame(draw);
export {};
