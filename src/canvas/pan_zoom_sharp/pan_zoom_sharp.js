// helpers
var diffPoints = function (p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    };
};
var addPoints = function (p1, p2) {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
    };
};
function scalePoint(p1, scale) {
    return { x: p1.x / scale, y: p1.y / scale };
}
// constants
var ORIGIN = Object.freeze({ x: 0, y: 0 });
var SQUARE_SIZE = 20;
var ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
var MAX_SCALE = 50;
var MIN_SCALE = 0.1;
// dom
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var debugDiv = document.getElementById("debug");
// "props"
var initialScale = 0.75;
var initialOffset = { x: 10, y: 20 };
// "state"
var mousePos = ORIGIN;
var lastMousePos = ORIGIN;
var offset = initialOffset;
var scale = initialScale;
// when setting up canvas, set width/height to devicePixelRation times normal
var _a = window.devicePixelRatio, devicePixelRatio = _a === void 0 ? 1 : _a;
context.canvas.width = context.canvas.width * devicePixelRatio;
context.canvas.height = context.canvas.height * devicePixelRatio;
function draw() {
    window.requestAnimationFrame(draw);
    // clear canvas
    context.canvas.width = context.canvas.width;
    // save untransformed coordinate state
    context.save();
    // transform coordinates - scale multiplied by devicePixelRatio
    context.scale(scale * devicePixelRatio, scale * devicePixelRatio);
    context.translate(offset.x, offset.y);
    // draw
    context.fillRect(250 + -SQUARE_SIZE / 2, 250 + -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    // debugging
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, 50);
    context.moveTo(0, 0);
    context.lineTo(50, 0);
    context.stroke();
    debugDiv.innerText = "scale: " + scale + "\n    mouse: " + JSON.stringify(mousePos) + "\n    offset: " + JSON.stringify(offset) + "\n  ";
    // restore untransformed states
    context.restore();
}
// track mouse
function handleUpdateMouse(event) {
    event.preventDefault();
    var viewportMousePos = { x: event.pageX, y: event.pageY };
    var boundingRect = canvas.getBoundingClientRect();
    var topLeftCanvasPos = { x: boundingRect.left, y: boundingRect.top };
    lastMousePos = mousePos;
    mousePos = diffPoints(viewportMousePos, topLeftCanvasPos);
}
document.addEventListener("mousemove", handleUpdateMouse);
// zoom
function handleWheel(event) {
    event.preventDefault();
    var zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
    var newScale = scale * zoom;
    if (MIN_SCALE > newScale || newScale > MAX_SCALE) {
        return;
    }
    // offset the canvas such that the point under the mouse doesn't move
    var lastMouse = scalePoint(mousePos, scale);
    var newMouse = scalePoint(mousePos, newScale);
    var mouseOffset = diffPoints(lastMouse, newMouse);
    offset = diffPoints(offset, mouseOffset);
    scale = newScale;
}
canvas.addEventListener("wheel", handleWheel);
// panning
var mouseMove = function () {
    var mouseDiff = scalePoint(diffPoints(mousePos, lastMousePos), scale);
    offset = addPoints(offset, mouseDiff);
};
var mouseUp = function () {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
};
var startPan = function () {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
};
canvas.addEventListener("mousedown", startPan);
// repeatedly redraw
window.requestAnimationFrame(draw);
export {};
