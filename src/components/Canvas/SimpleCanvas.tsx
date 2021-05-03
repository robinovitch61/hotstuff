import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import usePanZoom from "./hooks/usePanZoom";

export type SimpleCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

export default function SimpleCanvas(props: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [context, reset, viewportTopLeft, offset, scale, startPan] = usePanZoom(
    canvasRef,
    props.canvasWidth,
    props.canvasHeight
  );

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        reset(renderCtx);
      }
    }
  }, [reset, props.canvasHeight, props.canvasWidth]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);

      const squareSize = 20;
      context.fillRect(
        props.canvasWidth / 2 - squareSize / 2,
        props.canvasHeight / 2 - squareSize / 2,
        squareSize,
        squareSize
      );
      context.arc(viewportTopLeft.x, viewportTopLeft.y, 5, 0, 2 * Math.PI);
      context.fillStyle = "red";
      context.fill();
    }
  }, [
    props.canvasWidth,
    props.canvasHeight,
    context,
    scale,
    offset,
    viewportTopLeft,
  ]);

  return (
    <div>
      <button onClick={() => context && reset(context)}>Reset</button>
      <pre>scale: {scale}</pre>
      <pre>offset: {JSON.stringify(offset)}</pre>
      <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
      <canvas
        id="canvas"
        onMouseDown={startPan}
        ref={canvasRef}
        width={props.canvasWidth}
        height={props.canvasHeight}
        style={{
          border: "2px solid #000",
        }}
      ></canvas>
    </div>
  );
}
