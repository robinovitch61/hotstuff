import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppConnection, AppNode, Point } from "../App";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";
import useWindowSize from "./hooks/resize";
import config from "../../config";

const { canvasHeightPerc, editorWidthPerc } = config;

type CanvasProps = {
  nodes: AppNode[];
  connections: AppConnection[];
  addNode: (node: AppNode) => void;
};

const StyledCanvas = styled.canvas`
  width: 100%;
  height: ${canvasHeightPerc * 100}vh;
  border: 1px solid black;
`;

export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const [windowWidth, windowHeight] = useWindowSize();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const scale = useScale(ref);

  const { nodes, connections } = props;

  function rescaleCanvas(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    const { devicePixelRatio: ratio = 1 } = window;
    canvas.width = windowWidth * (1 - editorWidthPerc) * ratio;
    canvas.height = windowHeight * canvasHeightPerc * ratio;
    context.scale(ratio, ratio);
  }

  function drawCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
  }

  function drawArrow(
    context: CanvasRenderingContext2D,
    start: AppNode,
    end: AppNode,
    color: string
  ) {
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    const headLength = 6;
    const headWidth = 4;
    // const xStartCorrection =
    //   end.center.xPos > start.center.xPos ? start.radius : -start.radius;
    // const yStartCorrection =
    //   end.center.yPos > start.center.yPos ? start.radius : -start.radius;
    const dx = end.center.xPos - start.center.xPos;
    const dy = end.center.yPos - start.center.yPos;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    context.translate(start.center.xPos, start.center.yPos);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(length, 0);
    context.moveTo(length - headLength, -headWidth);
    context.lineTo(length, 0);
    context.lineTo(length - headLength, headWidth);
    context.stroke();
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  // function drawArrow(
  //   context: CanvasRenderingContext2D,
  //   start: Point,
  //   end: Point,
  //   radius: number
  // ) {
  //   context.strokeStyle = "black";
  //   context.lineWidth = 4;
  //   context.fillStyle = "black";

  //   context.beginPath();
  //   context.moveTo(start.xPos, start.yPos);
  //   context.lineTo(end.xPos, end.yPos);
  //   context.stroke();

  //   const xCorrection = end.xPos > start.xPos ? -radius / 2 : radius / 2;
  //   const yCorrection = end.yPos > start.yPos ? -radius / 2 : radius / 2;
  //   const xCenter = end.xPos + xCorrection;
  //   const yCenter = end.yPos + yCorrection;

  //   context.beginPath();

  //   const initAngle = Math.atan2(end.yPos - start.yPos, end.xPos - start.xPos);
  //   const initX = radius * Math.cos(initAngle) + xCenter;
  //   const initY = radius * Math.sin(initAngle) + yCenter;

  //   context.moveTo(initX, initY);

  //   const firstArrowAngle = initAngle + (1.0 / 3.0) * (2 * Math.PI);
  //   const firstArrowX = radius * Math.cos(firstArrowAngle) + xCenter;
  //   const firstArrowY = radius * Math.sin(firstArrowAngle) + yCenter;

  //   context.lineTo(firstArrowX, firstArrowY);

  //   const secondArrowAngle = firstArrowAngle + (1.0 / 3.0) * (2 * Math.PI);
  //   const secondArrowX = radius * Math.cos(secondArrowAngle) + xCenter;
  //   const secondArrowY = radius * Math.sin(secondArrowAngle) + yCenter;

  //   context.lineTo(secondArrowX, secondArrowY);
  //   context.closePath();
  //   context.fill();
  // }

  function drawConnection(
    context: CanvasRenderingContext2D,
    source: AppNode,
    target: AppNode
  ) {
    drawArrow(context, source, target, "black");
  }

  function draw(
    context: CanvasRenderingContext2D,
    nodes: AppNode[],
    connections: AppConnection[]
  ) {
    nodes.map((node) => {
      const { xPos, yPos } = node.center;
      drawCircle(context, xPos, yPos, node.radius, node.color);
    });

    connections.map((conn) => {
      const { source, target } = conn;
      // TODO: Smarter way to do this?
      const sourceAppNode = nodes.filter((node) => node.id === source.id)[0];
      const targetAppNode = nodes.filter((node) => node.id === target.id)[0];
      drawConnection(context, sourceAppNode, targetAppNode);
    });
  }

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }
    rescaleCanvas(canvas, context);
    draw(context, nodes, connections);
  }, [nodes, connections, windowWidth, windowHeight]);

  return (
    <>
      <StyledCanvas ref={ref} onMouseDown={startPan} />
      <div>{JSON.stringify(offset)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(nodes)}</div>
    </>
  );
}
