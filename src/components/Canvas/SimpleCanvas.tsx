import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import { drawCircle, drawConnection, toNodeCoords } from "./canvasUtils";
import config from "../../config";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import { makePoint } from "./pointUtils";
import { makeNode } from "hotstuff-network";

const StyledCanvasWrapper = styled.div`
  display: block;
  position: relative;
`;

const StyledControls = styled.div`
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
`;

const StyledCanvas = styled.canvas`
  border: 1px solid red;
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

  const { nodes, connections, canvasHeight, canvasWidth } = props;

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
        <button onClick={() => context && reset(context)}>Reset</button>
      </StyledControls>
      <StyledCanvas
        width={canvasWidth}
        height={canvasHeight}
        ref={canvasRef}
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
