import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import { drawCircle, drawConnection } from "./canvasUtils";
import config from "../../config";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import {
  addPoints,
  diffPoints,
  makePoint,
  multiplyPointByScale,
  scalePoint,
} from "./pointUtils";
import { makeNode } from "hotstuff-network";

const StyledCanvasWrapper = styled.div`
  display: block;
  max-height: 100%;
  position: relative;
`;

const StyledControls = styled.div`
  z-index: 10;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0.5em;

  > button {
    padding: 0.5em;
  }
`;

const StyledCanvas = styled.canvas<{ cssWidth: number; cssHeight: number }>`
  border: 1px solid red;
  width: ${({ cssWidth }) => `${cssWidth}px`};
  height: ${({ cssHeight }) => `${cssHeight}px`};
`;

const { newNodeNamePrefix, defaultNodeRadius } = config;

export type SimpleCanvasProps = {
  nodes: AppNode[];
  connections: AppConnection[];
  addNode: (node: AppNode) => void;
  updateNode: (node: AppNode) => void;
  setActiveNode: (nodeId: string) => void;
  clearActiveNode: () => void;
  canvasWidth: number;
  canvasHeight: number;
  devicePixelRatio: number;
};

export default function SimpleCanvas(
  props: SimpleCanvasProps
): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [
    context,
    reset,
    viewportTopLeft,
    offset,
    scale,
    startPan,
  ] = usePanZoomCanvas(canvasRef, props.canvasWidth, props.canvasHeight);

  const {
    nodes,
    connections,
    canvasHeight,
    canvasWidth,
    devicePixelRatio,
  } = props;

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
      center: scalePoint(
        diffPoints(
          makePoint(event.clientX, event.clientY),
          addPoints(offset, viewportTopLeft)
        ),
        scale
      ),
      radius: defaultNodeRadius,
      color: "red",
      isActive: false,
    };
    props.addNode(newAppNode);
  }

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        reset(renderCtx);
      }
    }
  }, [reset, canvasHeight, canvasWidth, canvasRef, context]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);

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

      context.save();
      context.beginPath();
      context.fillStyle = "green";
      context.arc(viewportTopLeft.x, viewportTopLeft.y, 5, 0, Math.PI * 2);
      context.fill();
      context.closePath();
      context.beginPath();
      context.fillStyle = "blue";
      context.arc(offset.x, offset.y, 5, 0, Math.PI * 2);
      context.fill();
      context.closePath();
      context.restore();
    }
  }, [
    canvasWidth,
    canvasHeight,
    context,
    scale,
    offset,
    viewportTopLeft,
    nodes,
    connections,
  ]);

  return (
    <StyledCanvasWrapper>
      <StyledControls>
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
        <button onClick={() => context && reset(context)}>
          Reset Viewport
        </button>
      </StyledControls>
      <StyledCanvas
        ref={canvasRef}
        width={canvasWidth * devicePixelRatio}
        height={canvasHeight * devicePixelRatio}
        cssWidth={canvasWidth}
        cssHeight={canvasHeight}
        onMouseDown={startPan}
        onDoubleClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
          if (canvas === null) {
            return;
          }
          handleDoubleClick(canvas, event, nodes);
        }}
      />
    </StyledCanvasWrapper>
  );
}
