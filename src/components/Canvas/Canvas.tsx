import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppConnection, AppNode, Point } from "../App";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";
import useWindowSize from "./hooks/resize";
import config from "../../config";
import { makeNode } from "hotstuff-network";

const {
  canvasHeightPerc,
  editorWidthPerc,
  defaultNodeRadius,
  newNodeNamePrefix,
} = config;

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

function rescaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  windowWidth: number,
  windowHeight: number
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
  context.lineWidth = 2;
  const headLength = 9;
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

export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const [windowWidth, windowHeight] = useWindowSize();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [scale, scaleMousePos] = useScale(ref, 0.06);

  const { nodes, connections } = props;

  // TODO: move origin to middle
  // useEffect(() => {
  //   const canvas = ref.current;
  //   if (canvas === null) {
  //     return;
  //   }
  //   const context = canvas.getContext("2d");
  //   if (context === null) {
  //     return;
  //   }
  //   context.translate(canvas.width / 2, canvas.height / 2);
  // }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }
    rescaleCanvas(canvas, context, windowWidth, windowHeight);
    context.translate(offset.x, offset.y);
    // TODO: scale about mouse (http://phrogz.net/tmp/canvas_zoom_to_cursor.html)
    context.scale(scale, scale);
    draw(context, nodes, connections);
  }, [
    nodes,
    connections,
    windowWidth,
    windowHeight,
    offset.x,
    offset.y,
    scale,
  ]);

  function handleDoubleClick(
    canvas: HTMLCanvasElement,
    event: React.MouseEvent<HTMLCanvasElement>,
    nodes: AppNode[]
  ) {
    const numNewNodes = nodes.filter((node) =>
      node.name.startsWith(newNodeNamePrefix)
    ).length;
    const newNode = makeNode({
      name: `${newNodeNamePrefix}${numNewNodes + 1}`,
      temperatureDegC: 0,
      capacitanceJPerDegK: 0,
      powerGenW: 0,
      isBoundary: false,
    });
    const boundingRect = canvas.getBoundingClientRect();
    const newAppNode = {
      ...newNode,
      center: {
        xPos: (event.clientX - boundingRect.left - offset.x) / scale,
        yPos: (event.clientY - boundingRect.top - offset.y) / scale,
      },
      radius: defaultNodeRadius,
      color: "red",
    };
    props.addNode(newAppNode);
  }

  return (
    <>
      <StyledCanvas
        ref={ref}
        onMouseDown={startPan}
        onDoubleClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = ref.current;
          if (canvas === null) {
            return;
          }
          handleDoubleClick(canvas, event, nodes);
        }}
      />
      <div>{JSON.stringify(offset)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(scaleMousePos)}</div>
      <div>{JSON.stringify(nodes)}</div>
    </>
  );
}
