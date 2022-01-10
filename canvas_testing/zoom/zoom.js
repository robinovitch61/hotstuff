// helpers
const diffPoints = (p1, p2) => {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    };
};
const addPoints = (p1, p2) => {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
    };
};
function scalePoint(p1, scale) {
    return { x: p1.x / scale, y: p1.y / scale };
}
// constants
const ORIGIN = Object.freeze({ x: 0, y: 0 });
const SQUARE_SIZE = 20;
const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
const MAX_SCALE = 50;
const MIN_SCALE = 0.1;
// dom
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const debugDiv = document.getElementById("debug");
// "props"
const initialScale = 0.75;
const initialOffset = { x: 10, y: 20 };
// "state"
let mousePos = ORIGIN;
let lastMousePos = ORIGIN;
let offset = initialOffset;
let scale = initialScale;
function draw() {
    window.requestAnimationFrame(draw);
    // clear canvas
    context.canvas.width = context.canvas.width;
    // transform coordinates - scale multiplied by devicePixelRatio
    context.scale(scale, scale);
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
    debugDiv.innerText = `scale: ${scale}
    mouse: ${JSON.stringify(mousePos)}
    offset: ${JSON.stringify(offset)}
  `;
}
// calculate mouse position on canvas relative to top left canvas point on page
function calculateMouse(event, canvas) {
    const viewportMousePos = { x: event.pageX, y: event.pageY };
    const boundingRect = canvas.getBoundingClientRect();
    const topLeftCanvasPos = { x: boundingRect.left, y: boundingRect.top };
    return diffPoints(viewportMousePos, topLeftCanvasPos);
}
// zoom
function handleWheel(event) {
    event.preventDefault();
    // update mouse position
    const newMousePos = calculateMouse(event, canvas);
    lastMousePos = mousePos;
    mousePos = newMousePos;
    // calculate new scale/zoom
    const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
    const newScale = scale * zoom;
    if (MIN_SCALE > newScale || newScale > MAX_SCALE) {
        return;
    }
    // offset the canvas such that the point under the mouse doesn't move
    const lastMouse = scalePoint(mousePos, scale);
    const newMouse = scalePoint(mousePos, newScale);
    const mouseOffset = diffPoints(lastMouse, newMouse);
    offset = diffPoints(offset, mouseOffset);
    scale = newScale;
}
canvas.addEventListener("wheel", handleWheel);
// repeatedly redraw
window.requestAnimationFrame(draw);
export {};
