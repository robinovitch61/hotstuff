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
// constants
var ORIGIN = Object.freeze({
    x: 0,
    y: 0,
});
var SQUARE_SIZE = 20;
var ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
// dom
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var mousePosDiv = document.getElementById("mousePos");
// "props"
var initialScale = 1;
var initialOffset = {
    x: 0,
    y: 0,
};
// "state"
var mousePos = ORIGIN;
var lastMousePos = ORIGIN;
var offset = initialOffset;
var scale = initialScale;
function draw() {
    window.requestAnimationFrame(draw);
    // clear canvas
    context.canvas.width = context.canvas.width;
    // transform coordinates and draw stuff, then restore transforms
    context.save();
    context.scale(scale, scale);
    context.translate((context.canvas.width / 2 + offset.x) / scale, (context.canvas.height / 2 + offset.y) / scale);
    context.fillRect(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    context.restore();
    mousePosDiv.innerText = JSON.stringify(mousePos);
}
function handleWheel(event) {
    event.preventDefault();
    var zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
    scale = scale * zoom;
}
function handleUpdateMouse(event) {
    event.preventDefault();
    var viewportMousePos = { x: event.clientX, y: event.clientY };
    var boundingRect = canvas.getBoundingClientRect();
    var topLeftCanvasPos = {
        x: boundingRect.left,
        y: boundingRect.top,
    };
    mousePos = diffPoints(viewportMousePos, topLeftCanvasPos);
}
canvas.addEventListener("wheel", handleWheel);
canvas.addEventListener("mousemove", handleUpdateMouse);
window.requestAnimationFrame(draw);
export {};
