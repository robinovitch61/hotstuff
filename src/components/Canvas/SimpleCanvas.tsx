import { useLayoutEffect, useRef, useState } from "react";
import useEventListener from "./hooks/useEventListener";
import useLast from "./hooks/useLast";
import useMousePos from "./hooks/useMousePos";
import useScale from "./hooks/useScale";
import { addPoints, Point } from "./pointUtils";

export type SimpleCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

export default function SimpleCanvas(props: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const mousePos = useMousePos(canvasRef);
  const adjustedOrigin = useRef<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        // // scale for pixels
        // const { devicePixelRatio: ratio = 1 } = window;
        // renderCtx.canvas.width = props.canvasWidth * ratio;
        // renderCtx.canvas.height = props.canvasHeight * ratio;
        // renderCtx.scale(ratio, ratio);
        setContext(renderCtx);
      }
    }
  }, [context]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      const squareSize = 50;

      // reset canvas but maintain transform
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
  }, [context, scale]);

  // zoom when scale changes
  useEventListener(canvasRef, "wheel", (event: WheelEvent) => {
    if (context) {
      event.preventDefault();
      const zoom = 1 - event.deltaY / 240;
      console.log(zoom);
      const adjustedOriginDelta = {
        x: (mousePos.x / scale) * (1 - 1 / zoom),
        y: (mousePos.y / scale) * (1 - 1 / zoom),
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
  });
  // useLayoutEffect(() => {
  //   if (context) {
  //     // a bit above 1 when zooming in, a bit below one when zooming out
  //     const scaleFactor = 1 + scale - lastScale;
  //     context.translate(adjustedOrigin.current.x, adjustedOrigin.current.y);
  //     context.scale(scaleFactor, scaleFactor);
  //   }
  // }, [scale]);

  return (
    <div>
      <button onClick={() => setScale(1)}>Reset Zoom</button>
      <pre>scale: {scale}</pre>
      {/* <pre>lastScale: {lastScale}</pre> */}
      <pre>
        mouse: {mousePos.x}, {mousePos.y}
      </pre>
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
