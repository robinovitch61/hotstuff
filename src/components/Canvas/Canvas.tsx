import p5Types from "p5";
import Sketch from "react-p5";
import React from "react";
import {HotNode, Point} from "../App";
import Qty from 'js-quantities';

type CanvasProps = {
  nodes: HotNode[]
  addNode: (node: HotNode) => void
}

export default function Canvas(props: CanvasProps) {
  console.log("RERENDERED");
  const SCALE_INCREMENT = 0.03;
  const SCROLL_SPEED_SCALE_EFFECT = 0.005;
  const RESET_VIEW_KEY = 32; // 32 is space
  const DEFAULT_NODE_WIDTH = 50; // pixels
  const DEFAULT_NODE_HEIGHT = DEFAULT_NODE_WIDTH; // pixels
  // const theseNodes: HotNode[] = [];

  let canResetView = false;
  let translateX = 0;
  let translateY = 0;
  let scaleFactor = 1;

  function getScaleAdjustment(requestedScroll: number): number {
    if (requestedScroll < 0) {
      return (1 + SCALE_INCREMENT) + (-requestedScroll * SCROLL_SPEED_SCALE_EFFECT);
    } else {
      return (1 - SCALE_INCREMENT) - (requestedScroll * SCROLL_SPEED_SCALE_EFFECT);
    }
  }

  const handleMouseWheel = (p5: p5Types, event: WheelEvent) => {
    const scaleAdjustment = getScaleAdjustment(event.deltaY);
    scaleFactor *= scaleAdjustment;
    translateX = p5.mouseX * (1 - scaleAdjustment) + translateX * scaleAdjustment;
    translateY = p5.mouseY * (1 - scaleAdjustment) + translateY * scaleAdjustment;
    console.log(`scaleFactor ${scaleFactor}`);
    console.log(`translateX ${translateX}`);
    console.log(`translateY ${translateY}`);
    canResetView = true;
  };

  function setup(p5: p5Types) {
    console.log(`windowWidth: ${p5.windowWidth}`);
    console.log(`windowHeight: ${p5.windowHeight}`);
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.mouseWheel((event: WheelEvent) => handleMouseWheel(p5, event));
  }

  function drawCircle(p5: p5Types, topLeftCorner: Point, bottomRightCorner: Point) {
    const width = bottomRightCorner.xPos - topLeftCorner.xPos;
    const halfWidth = Math.floor(width / 2);
    const xCenter = topLeftCorner.xPos + halfWidth;
    const yCenter = topLeftCorner.yPos + halfWidth;
    p5.circle(xCenter, yCenter, width);
  }

  function drawNodes(p5: p5Types, nodes: HotNode[]) {
    nodes.forEach(node => drawCircle(p5, node.topLeftCorner, node.bottomRightCorner));
  }

  let frameCount = 0;
  function draw(p5: p5Types) {
    p5.background(255);
    p5.translate(translateX, translateY);
    p5.scale(scaleFactor);
    if (frameCount % 50 === 0) {
      console.log(`mouseX: ${p5.mouseX}`);
      console.log(`mouseY: ${p5.mouseY}`);
    }

    // if (props.nodes[0]) {
    //   console.log(props.nodes[0].bottomRightCorner);
    // }
    drawNodes(p5, props.nodes);
    // drawNodes(p5, theseNodes);
    p5.rect(100, 100, 100, 100);
    p5.rect(50, 50, 100, 100);
    p5.circle(150, 150, 50);
    p5.text(p5.keyCode, 33, 65);

    if (p5.mouseIsPressed) {
      translateX -= p5.pmouseX - p5.mouseX;
      translateY -= p5.pmouseY - p5.mouseY;
      console.log(`translateX ${translateX}`);
      console.log(`translateY ${translateY}`);
      canResetView = true;
    }
    if (canResetView && p5.keyIsDown(RESET_VIEW_KEY)) {
      scaleFactor = 1;
      translateX = 0;
      translateY = 0;
      canResetView = false;
      console.log('reset');
    }
    frameCount += 1;
  }

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  const doubleClicked = (p5: p5Types) => {
    const halfWidth = Math.floor(DEFAULT_NODE_WIDTH / 2) * scaleFactor;
    const halfHeight = Math.floor(DEFAULT_NODE_HEIGHT / 2) * scaleFactor;
    const topLeftCorner: Point = {
      xPos:  (p5.mouseX - halfWidth - translateX) / scaleFactor,
      yPos: (p5.mouseY - halfHeight - translateY) / scaleFactor
    };
    const bottomRightCorner: Point = {
      xPos: (p5.mouseX + halfWidth - translateX) / scaleFactor,
      yPos: (p5.mouseY + halfHeight - translateY) / scaleFactor
    };
    const newNode: HotNode = {
      topLeftCorner,
      bottomRightCorner,
      shape: 'Circle',
      thermalCapacitance: Qty('0 J/degK'),
      temperature: Qty('0 degC'),
      isBoundary: false
    };
    props.addNode(newNode);
    // theseNodes.push(newNode);
  };

  return (
      <Sketch
          setup={setup}
          draw={draw}
          windowResized={windowResized}
          doubleClicked={doubleClicked}
      />
  );
}