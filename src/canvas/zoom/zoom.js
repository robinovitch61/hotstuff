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
}
function handleWheel(event) {
    event.preventDefault();
    var zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
    scale = scale * zoom;
}
canvas.addEventListener("wheel", handleWheel);
window.requestAnimationFrame(draw);
export {};
