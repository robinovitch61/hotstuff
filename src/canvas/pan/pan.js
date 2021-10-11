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
// dom
var canvas = document.getElementById("canvas");
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
