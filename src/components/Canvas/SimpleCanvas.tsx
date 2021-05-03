import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { addPoints, diffPoints, ORIGIN, Point, scalePoint } from "./pointUtils";

export type SimpleCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

function useLast<T>(value: T): [T | undefined, (val: T) => void] {
  const ref = useRef<T>();
  // useEffect runs AFTER a render if a dependency has changed
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // return previous value
  return [ref.current, (val: T) => (ref.current = val)];
}

export default function SimpleCanvas(props: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const [lastOffset, setLastOffset] = useLast(offset);
  const adjustedOrigin = useRef<Point>(ORIGIN);
  const mousePosRef = useRef<Point>(ORIGIN);
  const lastMousePosRef = useRef<Point>(ORIGIN);

  // reset at start and on button click
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
        setOffset(ORIGIN);
        setLastOffset(ORIGIN);
        adjustedOrigin.current = ORIGIN;
        mousePosRef.current = ORIGIN;
        lastMousePosRef.current = ORIGIN;
      }
    }
  }

  // functions for panning
  function mouseMove(event: MouseEvent) {
    if (context) {
      const lastMousePos = lastMousePosRef.current;
      const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
      lastMousePosRef.current = currentMousePos;

      const mouseDiff = diffPoints(currentMousePos, lastMousePos);
      setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
    }
  }

  function mouseUp() {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }

  function startPan(event: React.MouseEvent) {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    lastMousePosRef.current = { x: event.pageX, y: event.pageY };
  }

  // pan when offset changes
  useLayoutEffect(() => {
    if (context && lastOffset) {
      const offsetDiff = scalePoint(diffPoints(offset, lastOffset), scale);
      context.translate(offsetDiff.x, offsetDiff.y);
      adjustedOrigin.current = diffPoints(adjustedOrigin.current, offsetDiff);
    }
  }, [offset]);

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
  }, [canvasRef, scale, offset]);

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
      <button onClick={reset}>Reset</button>
      <pre>scale: {scale}</pre>
      <pre>offset: {JSON.stringify(offset)}</pre>
      <canvas
        onMouseDown={startPan}
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
