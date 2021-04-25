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
import {
  drawCircle,
  drawConnection,
  intersectsCircle,
  toNodeCoords,
  drawArrow,
} from "./canvasUtils";
import useNodeMove from "./hooks/useNodeMove";
import useMakeConnection from "./hooks/useMakeConnection";

const {
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
  updateNode: (node: AppNode) => void;
  setActiveNode: (nodeId: string) => void;
  clearActiveNode: () => void;
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
    drawCircle(context, x, y, node.radius, node.color, node.isActive);
  });

  connections.map((conn) => {
    const { source, target } = conn;
    // TODO: Smarter way to do this?
    const sourceAppNode = nodes.filter((node) => node.id === source.id)[0];
    const targetAppNode = nodes.filter((node) => node.id === target.id)[0];
    drawConnection(context, sourceAppNode.center, targetAppNode.center);
  });
}

export default function Canvas(props: CanvasProps) {
  const [windowWidth, windowHeight] = useWindowSize();
  const [offset, setOffset, startPan] = usePan();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scale = useScale(canvasRef, zoomIncrement, minZoom, maxZoom);
  const activeNodeRef = useRef<AppNode>();
  // const mousePosRef = useMousePos(ref);
  const [nodeMoveOffset, startNodeMove] = useNodeMove();
  const [
    makeConnectionMouse,
    makeConnectionDone,
    startMakeConnection,
  ] = useMakeConnection();

  const { nodes, connections } = props;

  // set offset to middle of canvas to zoom about center
  useLayoutEffect(() => {
    setOffset(makePoint(-props.canvasWidth / 2, -props.canvasHeight / 2));
  }, [props.canvasHeight, props.canvasWidth]);

  // main canvas update hook
  useLayoutEffect(() => {
    // get context and canvas
    const canvas = canvasRef.current;
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

    // // TODO: can remove, helpful for debugging
    // // origin and axis
    // const currentMouseX = (mousePosRef.current.x + offset.x) / scale;
    // const currentMouseY = (mousePosRef.current.y + offset.y) / scale;
    // context.save();
    // context.fillStyle = "black";
    // context.strokeStyle = "black";
    // context.lineWidth = 2;
    // context.arc(0, 0, 5, 0, Math.PI * 2);
    // context.fill();
    // context.beginPath();
    // context.moveTo(0, 0);
    // context.lineTo(40, 0);
    // context.stroke();
    // context.beginPath();
    // context.moveTo(0, 0);
    // context.lineTo(0, 40);
    // context.stroke();
    // // mouse pos
    // context.beginPath();
    // context.arc(currentMouseX, currentMouseY, 5, 0, Math.PI * 2);
    // context.fill();
    // context.restore();

    draw(context, nodes, connections);
  }, [
    nodes,
    connections,
    makeConnectionMouse,
    windowWidth,
    windowHeight,
    offset.x,
    offset.y,
    scale,
  ]);

  // move active node if it's moving
  useLayoutEffect(() => {
    if (activeNodeRef.current === undefined) {
      return;
    }
    activeNodeRef.current = {
      ...activeNodeRef.current,
      center: diffPoints(
        activeNodeRef.current.center,
        scalePoint(nodeMoveOffset, scale)
      ),
    };
    props.updateNode(activeNodeRef.current);
  }, [nodeMoveOffset]);

  // draw connection if it's being made
  useLayoutEffect(() => {
    if (activeNodeRef.current === undefined) {
      return;
    }
    // get context and canvas
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    drawArrow(
      context,
      activeNodeRef.current.center,
      toNodeCoords(canvas, makeConnectionMouse, offset, scale),
      "grey"
    );
  }, [makeConnectionMouse, makeConnectionDone]);

  function handleDoubleClick(
    canvas: HTMLCanvasElement,
    event: React.MouseEvent<HTMLCanvasElement>,
    nodes: AppNode[]
  ) {
    const numNewNodes = nodes.filter((node) =>
      node.name.startsWith(newNodeNamePrefix)
    ).length;
    const newNode = makeNode({
      name:
        numNewNodes === 0
          ? `${newNodeNamePrefix}`
          : `${newNodeNamePrefix} (${numNewNodes + 1})`,
      temperatureDegC: 0,
      capacitanceJPerDegK: 0,
      powerGenW: 0,
      isBoundary: false,
    });
    const newAppNode = {
      ...newNode,
      center: toNodeCoords(
        canvas,
        makePoint(event.clientX, event.clientY),
        offset,
        scale
      ),
      radius: defaultNodeRadius,
      color: "red",
      isActive: false,
    };
    props.addNode(newAppNode);
  }

  function handleOnMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    let nodeClicked = false;
    nodes.some((node) => {
      if (
        intersectsCircle(
          toNodeCoords(
            canvas,
            makePoint(event.clientX, event.clientY),
            offset,
            scale
          ),
          node.center,
          node.radius
        )
      ) {
        nodeClicked = true;
        props.setActiveNode(node.id);
        // TODO: Make less janky
        activeNodeRef.current = { ...node, isActive: true };
        if (event.altKey) {
          startMakeConnection(event);
        } else {
          startNodeMove(event);
        }
        return true; // short circuits the rest of the some loop
      }
    });

    if (!nodeClicked) {
      props.clearActiveNode();
      startPan(event);
    }
  }

  return (
    <>
      <StyledCanvas
        ref={canvasRef}
        onMouseDown={handleOnMouseDown}
        onDoubleClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
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
