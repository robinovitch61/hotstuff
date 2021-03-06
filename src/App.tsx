import React, {ContextType} from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import * as R from 'ramda'

interface ComponentProps {
  //Your component props
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let widthCanvas: number;
let heightCanvas: number;

// View parameters
var xleftView = 0;
var ytopView = 0;
var widthViewOriginal = 1.0;           //actual width and height of zoomed and panned display
var heightViewOriginal = 1.0;
var widthView = widthViewOriginal;           //actual width and height of zoomed and panned display
var heightView = heightViewOriginal;

window.addEventListener("load", setup, false);

function setup() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  widthCanvas = canvas.width;
  heightCanvas = canvas.height;

  canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
  canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);
  canvas.addEventListener("mousewheel", handleMouseWheel as EventListener, false); // mousewheel duplicates dblclick function
  canvas.addEventListener("DOMMouseScroll", handleMouseWheel as EventListener, false); // for Firefox

  draw();
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(widthCanvas / widthView, heightCanvas / heightView);
  ctx.translate(-xleftView, -ytopView);

  ctx.fillStyle = "yellow";
  ctx.fillRect(xleftView, ytopView, widthView, heightView);
  ctx.fillStyle = "blue";
  ctx.fillRect(0.1, 0.5, 0.1, 0.1);
  ctx.fillStyle = "red";
  ctx.fillRect(0.3, 0.2, 0.4, 0.2);
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(widthView / 2 + xleftView, heightView / 2 + ytopView, 0.05, 0, 360, false);
  ctx.fill();
}

function handleDblClick(event: MouseEvent) {
  var X = event.clientX - canvas.offsetLeft - canvas.clientLeft + canvas.scrollLeft; //Canvas coordinates
  var Y = event.clientY - canvas.offsetTop - canvas.clientTop + canvas.scrollTop;
  var x = X / widthCanvas * widthView + xleftView;  // View coordinates
  var y = Y / heightCanvas * heightView + ytopView;

  var scale = event.shiftKey ? 1.5 : 0.5; // shrink (1.5) if shift key pressed
  widthView *= scale;
  heightView *= scale;

  if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
    widthView = widthViewOriginal;
    heightView = heightViewOriginal;
    x = widthView / 2;
    y = heightView / 2;
  }

  xleftView = x - widthView / 2;
  ytopView = y - heightView / 2;

  draw();
}

var mouseDown = false;

function handleMouseDown(event: Event) {
  mouseDown = true;
}

function handleMouseUp(event: Event) {
  mouseDown = false;
}

var lastX = 0;
var lastY = 0;

function handleMouseMove(event: MouseEvent) {
  var X = event.clientX - canvas.offsetLeft - canvas.clientLeft + canvas.scrollLeft;
  var Y = event.clientY - canvas.offsetTop - canvas.clientTop + canvas.scrollTop;

  if (mouseDown) {
    var dx = (X - lastX) / widthCanvas * widthView;
    var dy = (Y - lastY) / heightCanvas * heightView;
    xleftView -= dx;
    ytopView -= dy;
  }
  lastX = X;
  lastY = Y;

  draw();
}

function handleMouseWheel(event: WheelEvent) {
  var x = widthView / 2 + xleftView;  // View coordinates
  var y = heightView / 2 + ytopView;

  var scale = (event.deltaY > 0 || event.detail > 0) ? 1.1 : 0.9;
  widthView *= scale;
  heightView *= scale;

  if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
    widthView = widthViewOriginal;
    heightView = heightViewOriginal;
    x = widthView / 2;
    y = heightView / 2;
  }

  // scale about center of view, rather than mouse position. This is different than dblclick behavior.
  xleftView = x - widthView / 2;
  ytopView = y - heightView / 2;

  draw();
}

export default function App(props: ComponentProps) {
  return (
      <canvas id="canvas" width="800" height="800"></canvas>
  )
  // const x = 50;
  // const y = 50;
  //
  // //See annotations in JS for more information
  // const setup = (p5: p5Types, canvasParentRef: Element) => {
  //   p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
  // };
  //
  // const draw = (p5: p5Types) => {
  //   p5.background(0);
  //   Array.from(Array(100).keys()).map(ystart => p5.ellipse(x, ystart * 10, x, x));
  //   x++;
  // };
  //
  // const windowResized = (p5: p5Types) => {
  //   p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  // }
  //
  // return <Sketch setup={setup} draw={draw} windowResized={windowResized}/>;
};
