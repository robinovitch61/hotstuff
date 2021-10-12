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
var ORIGIN = Object.freeze({
    x: 0,
    y: 0,
});
var SQUARE_SIZE = 20;
var ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
// const MAX_SCALE = 2.5;
// const MIN_SCALE = 1;
var MAX_SCALE = 3;
var MIN_SCALE = 0.5;
// dom
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var debugDiv = document.getElementById("debug");
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
function draw() {
    window.requestAnimationFrame(draw);
    // clear canvas
    context.canvas.width = context.canvas.width;
    // calculate stuff
    var scaledOffset = scalePoint(offset, scale);
    // transform coordinates and draw stuff, then restore transforms
    context.save();
    context.scale(scale, scale);
    context.translate(scaledOffset.x, scaledOffset.y);
    // context.translate(offset.x, offset.y);
    context.fillRect(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    // debugging
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, 50);
    context.moveTo(0, 0);
    context.lineTo(50, 0);
    context.stroke();
    debugDiv.innerText = "scale: " + scale + "\n    mouse: " + JSON.stringify(mousePos) + "\n    offset: " + JSON.stringify(offset) + "\n  ";
    context.restore();
}
function handleWheel(event) {
    event.preventDefault();
    // const zoom = event.deltaY < 0 ? 1.5 : -1.5;
    // const zoom = event.deltaY < 0 ? 0.1 : -0.1;
    var zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
    var newScale = scale * zoom;
    if (MIN_SCALE > newScale || newScale > MAX_SCALE) {
        return;
    }
    // adjust the offset
    // offset = addPoints(offset, { x: 1, y: 1 });
    var lastMouse = scalePoint(diffPoints(mousePos, offset), scale);
    var newMouse = scalePoint(diffPoints(mousePos, offset), newScale);
    var mouseOffset = diffPoints(lastMouse, newMouse);
    offset = diffPoints(offset, mouseOffset);
    scale = newScale;
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
