import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as canvasUtils from "./canvasUtils";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import {
  Point,
  addPoints,
  diffPoints,
  scalePoint,
  ORIGIN,
  makePoint,
} from "./pointUtils";
import usePan from "./hooks/usePan";
import useScale from "./hooks/useScale";
import useWindowSize from "./hooks/useWindowSize";
import useMousePos from "./hooks/useMousePos";
import useLast from "./hooks/useLast";
import config from "../../config";
import { makeNode } from "hotstuff-network";

const {
  canvasHeightPerc,
  defaultNodeRadius,
  editorWidthPerc,
  newNodeNamePrefix,
  zoomIncrement,
  minZoom,
  maxZoom,
} = config;

type CanvasProps = {
  nodes: AppNode[];
  connections: AppConnection[];
  addNode: (node: AppNode) => void;
  canvasWidth: number;
  canvasHeight: number;
};

const StyledCanvas = styled.canvas`
  position: relative;
  border: 1px solid red;
  max-height: 100%;
  max-width: 100%;
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
  const [windowWidth, windowHeight] = useWindowSize();
  const [offset, setOffset, startPan] = usePan();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const scale = useScale(ref, zoomIncrement, minZoom, maxZoom);
  const mousePosRef = useMousePos(ref);

  const { nodes, connections } = props;

  // set offset to middle of canvas to zoom about center
  useEffect(() => {
    setOffset(makePoint(-props.canvasWidth / 2, -props.canvasHeight / 2));
  }, [props.canvasHeight, props.canvasWidth]);

  // main canvas update hook
  useLayoutEffect(() => {
    // get context and canvas
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    // adjust for pixel clarity based on screen
    canvasUtils.rescaleCanvas(
      canvas,
      context,
      props.canvasWidth,
      props.canvasHeight
    );

    context.translate(-offset.x, -offset.y);

    // TODO: scale about mouse?? (http://phrogz.net/tmp/canvas_zoom_to_cursor.html, https://www.jclem.net/posts/pan-zoom-canvas-react, https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate)
    context.scale(scale, scale);

    // TODO: can remove, helpful for debugging
    // origin and axis
    const currentMouseX = (mousePosRef.current.x + offset.x) / scale;
    const currentMouseY = (mousePosRef.current.y + offset.y) / scale;
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
      center: makePoint(
        (event.clientX - boundingRect.left + offset.x) / scale,
        (event.clientY - boundingRect.top + offset.y) / scale
      ),
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
      <div style={{ position: "absolute", top: 0 }}>
        {nodes.map((node) => (
          <pre>{JSON.stringify(node, null, 2)}</pre>
        ))}
      </div>
    </>
  );
}
