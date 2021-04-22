import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as canvasUtils from "./canvasUtils";
import styled from "styled-components";
import { AppConnection, AppNode, Point } from "../App";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";
import useMousePos from "./hooks/useMousePos";
import useLast from "./hooks/useLast";
import useWindowSize from "./hooks/resize";
import config from "../../config";
import { makeNode } from "hotstuff-network";

const {
  canvasHeightPerc,
  defaultNodeRadius,
  newNodeNamePrefix,
  zoomIncrement,
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
  console.log("RERENDER");
  const [offset, startPan] = usePan();
  const [windowWidth, windowHeight] = useWindowSize();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const scale = useScale(ref, zoomIncrement);
  const mousePosRef = useMousePos(ref);
  const lastOffset = useLast<Point>(offset);
  const lastScale = useLast<number>(scale);

  const { nodes, connections } = props;

  // Calculate the delta between the current and last offset—how far the user has panned.
  // const delta = pointUtils.diff(offset, lastOffset)
  const delta = { x: offset.x - lastOffset.x, y: offset.y - lastOffset.y };
  console.log(`delta: ${JSON.stringify(delta)}`);

  // Since scale also affects offset, we track our own "real" offset that's
  // changed by both panning and zooming.
  // const adjustedOffset = useRef(pointUtils.sum(offset, delta));
  const adjustedOffset = useRef<Point>({
    x: offset.x + delta.x,
    y: offset.y + delta.y,
  });

  if (lastScale === scale) {
    // No change in scale—just apply the delta between the last and new offset
    // to the adjusted offset.
    // adjustedOffset.current = pointUtils.sum(
    //   adjustedOffset.current,
    //   pointUtils.scale(delta, scale)
    // );
    const scaledDelta = { x: delta.x / scale, y: delta.y / scale };

    console.log(
      `adjustedOffset.current: ${JSON.stringify(adjustedOffset.current)}`
    );
    console.log(`scaledDelta.x: ${scaledDelta.x}`);
    const nextAdjOffset = {
      x: adjustedOffset.current.x + scaledDelta.x,
      y: adjustedOffset.current.y + scaledDelta.y,
    };
    console.log(`next should be ${JSON.stringify(nextAdjOffset)}`);
    adjustedOffset.current = nextAdjOffset;
  }
  // } else {
  //   // The scale has changed—adjust the offset to compensate for the change in
  //   // relative position of the pointer to the canvas.
  //   // const lastMouse = pointUtils.scale(mousePosRef.current, lastScale);
  //   // const newMouse = pointUtils.scale(mousePosRef.current, scale);
  //   // const mouseOffset = pointUtils.diff(lastMouse, newMouse);
  //   // adjustedOffset.current = pointUtils.sum(
  //   //   adjustedOffset.current,
  //   //   mouseOffset
  //   // );
  //   const lastMouse = {
  //     x: mousePosRef.current.x / lastScale,
  //     y: mousePosRef.current.y / lastScale,
  //   };
  //   const newMouse = {
  //     x: mousePosRef.current.x / scale,
  //     y: mousePosRef.current.y / scale,
  //   };
  //   const mouseOffset = {
  //     x: lastMouse.x - newMouse.x,
  //     y: lastMouse.y - newMouse.y,
  //   };
  //   adjustedOffset.current = {
  //     x: adjustedOffset.current.x + mouseOffset.x,
  //     y: adjustedOffset.current.y + mouseOffset.y,
  //   };
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
    // TODO: scale about mouse (http://phrogz.net/tmp/canvas_zoom_to_cursor.html, https://www.jclem.net/posts/pan-zoom-canvas-react)
    context.translate(-adjustedOffset.current.x, -adjustedOffset.current.y);
    context.scale(scale, scale);
    // context.translate(
    //   adjustedOffset.current.x / scale,
    //   adjustedOffset.current.y / scale
    // );
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

  console.log("DONE RERENDER");
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
      <div>adjustedOffset: {JSON.stringify(adjustedOffset.current)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(mousePosRef.current)}</div>
      <div>{JSON.stringify(nodes)}</div>
    </>
  );
}
