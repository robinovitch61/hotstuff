import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as canvasUtils from "./canvasUtils";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import { Point, addPoints, diffPoints, scalePoint, ORIGIN } from "./pointUtils";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";
import useWindowSize from "./hooks/resize";
import useMousePos from "./hooks/useMousePos";
import useLast from "./hooks/useLast";
import config from "../../config";
import { makeNode } from "hotstuff-network";

const {
  canvasHeightPerc,
  defaultNodeRadius,
  newNodeNamePrefix,
  zoomIncrement,
  minZoom,
  maxZoom,
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

function draw(
  context: CanvasRenderingContext2D,
  nodes: AppNode[],
  connections: AppConnection[]
) {
  nodes.map((node) => {
    const { x, y } = node.center;
    canvasUtils.drawCircle(context, x, y, node.radius, node.color);
  });

  connections.map((conn) => {
    const { source, target } = conn;
    // TODO: Smarter way to do this?
    const sourceAppNode = nodes.filter((node) => node.id === source.id)[0];
    const targetAppNode = nodes.filter((node) => node.id === target.id)[0];
    canvasUtils.drawConnection(
      context,
      sourceAppNode.center,
      targetAppNode.center
    );
  });
}

export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const scale = useScale(ref, zoomIncrement, minZoom, maxZoom);
  const mousePosRef = useMousePos(ref);
  const lastOffset = useLast(offset);
  const lastScale = useLast(scale);

  const { nodes, connections } = props;

  // // Calculate the delta between the current and last offset—how far the user has panned.
  // const delta = diffPoints(offset, lastOffset || ORIGIN);

  // // Since scale also affects offset, we track our own "real" offset that's
  // // changed by both panning and zooming.
  // const adjustedOffset = useRef(addPoints(offset, delta));

  // if (lastScale === scale) {
  //   // No change in scale—just apply the delta between the last and new offset
  //   // to the adjusted offset.
  //   adjustedOffset.current = addPoints(
  //     adjustedOffset.current,
  //     scalePoint(delta, scale)
  //   );
  // } else {
  //   // The scale has changed—adjust the offset to compensate for the change in
  //   // relative position of the pointer to the canvas.
  //   const lastMouse = scalePoint(mousePosRef.current, lastScale || 1);
  //   const newMouse = scalePoint(mousePosRef.current, scale);
  //   const mouseOffset = diffPoints(lastMouse, newMouse);
  //   adjustedOffset.current = addPoints(adjustedOffset.current, mouseOffset);
  // }

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    canvasUtils.rescaleCanvas(canvas, context, windowWidth, windowHeight);
    context.translate(-offset.x, -offset.y);
    // TODO: scale about mouse (http://phrogz.net/tmp/canvas_zoom_to_cursor.html, https://www.jclem.net/posts/pan-zoom-canvas-react, https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate)
    const currentMouseX = (mousePosRef.current.x + offset.x) / scale;
    const currentMouseY = (mousePosRef.current.y + offset.y) / scale;
    // context.translate(currentMouseX, currentMouseY);
    context.scale(scale, scale);
    // context.translate(-currentMouseX, -currentMouseY);

    // TODO: remove, helpful for debugging
    // origin and axis
    context.save();
    context.fillStyle = "black";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(40, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, 40);
    context.stroke();
    // mouse pos
    context.beginPath();
    context.arc(currentMouseX, currentMouseY, 5, 0, Math.PI * 2);
    context.fill();
    context.restore();

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
        x: (event.clientX - boundingRect.left + offset.x) / scale,
        y: (event.clientY - boundingRect.top + offset.y) / scale,
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
      <div>offset: {JSON.stringify(offset)}</div>
      <div>lastOffset: {JSON.stringify(lastOffset)}</div>
      {/* <div>adjustedOffset: {JSON.stringify(adjustedOffset.current)}</div> */}
      <div>mouse: {JSON.stringify(mousePosRef.current)}</div>
      <div>scale: {scale}</div>
      <div>lastScale: {lastScale}</div>
      <div>{JSON.stringify(nodes)}</div>
    </>
  );
}
