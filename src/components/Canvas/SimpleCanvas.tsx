import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useEventListener from "./hooks/useEventListener";
import useLast from "./hooks/useLast";
import useMousePos from "./hooks/useMousePos";
import useScale from "./hooks/useScale";
import { addPoints, diffPoints, ORIGIN, Point } from "./pointUtils";

export type SimpleCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

export default function SimpleCanvas(props: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState<number>(1);
  const adjustedOrigin = useRef<Point>(ORIGIN);
  const mousePosRef = useRef<Point>(ORIGIN);

  function reset() {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        // scale for pixels
        const { devicePixelRatio: ratio = 1 } = window;
        renderCtx.canvas.width = props.canvasWidth * ratio;
        renderCtx.canvas.height = props.canvasHeight * ratio;
        renderCtx.scale(ratio, ratio);
        setScale(ratio);

        setContext(renderCtx);
        adjustedOrigin.current = ORIGIN;
      }
    }
  }

  // setup canvas and set context
  useLayoutEffect(() => {
    reset();
  }, [canvasRef]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      const squareSize = 50;

      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);

      context.fillRect(
        props.canvasWidth / 2 - squareSize / 2,
        props.canvasHeight / 2 - squareSize / 2,
        squareSize,
        squareSize
      );
    }
  }, [canvasRef, scale]);

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    function handleUpdateMouse(event: MouseEvent) {
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: canvasRef.current.offsetLeft,
          y: canvasRef.current.offsetTop,
        };
        mousePosRef.current = diffPoints(viewportMousePos, topLeftCanvasPos);
      }
    }

    canvasElem.addEventListener("mousemove", handleUpdateMouse);
    canvasElem.addEventListener("wheel", handleUpdateMouse);
    return () => {
      canvasElem.removeEventListener("mousemove", handleUpdateMouse);
      canvasElem.removeEventListener("wheel", handleUpdateMouse);
    };
  }, [canvasRef]);

  // add event listener on canvas for zoom
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    // this is really tricky
    function handleWheel(event: WheelEvent) {
      if (context) {
        const zoom = 1 - event.deltaY / 240;
        const adjustedOriginDelta = {
          x: (mousePosRef.current.x / scale) * (1 - 1 / zoom),
          y: (mousePosRef.current.y / scale) * (1 - 1 / zoom),
        };
        const newAdjustedOrigin = addPoints(
          adjustedOrigin.current,
          adjustedOriginDelta
        );

        context.translate(adjustedOrigin.current.x, adjustedOrigin.current.y);
        context.scale(zoom, zoom);
        context.translate(-newAdjustedOrigin.x, -newAdjustedOrigin.y);

        adjustedOrigin.current = newAdjustedOrigin;
        setScale(scale * zoom);
      }
    }

    canvasElem.addEventListener("wheel", handleWheel);
    return () => canvasElem.removeEventListener("wheel", handleWheel);
  }, [canvasRef, scale]);

  return (
    <div>
      <button onClick={reset}>Reset Zoom</button>
      <pre>scale: {scale}</pre>
      <canvas
        id="canvas"
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
