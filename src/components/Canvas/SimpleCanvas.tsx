import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { addPoints, diffPoints, ORIGIN, Point, scalePoint } from "./pointUtils";

export type SimpleCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

export default function SimpleCanvas(props: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const [mousePos, setMousePos] = useState<Point>(ORIGIN);
  const [isReset, setIsReset] = useState(false);
  const viewportTopLeftRef = useRef<Point>(ORIGIN);
  const lastMousePosRef = useRef<Point>(ORIGIN);
  const lastOffsetRef = useRef<Point>(ORIGIN);

  // reset at start and on button click
  function reset() {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx && !isReset) {
        // scale for pixels
        const { devicePixelRatio: ratio = 1 } = window;
        renderCtx.canvas.width = props.canvasWidth * ratio;
        renderCtx.canvas.height = props.canvasHeight * ratio;
        renderCtx.scale(ratio, ratio);
        setScale(ratio);

        // reset other values
        setContext(renderCtx);
        setOffset(ORIGIN);
        setMousePos(ORIGIN);
        lastOffsetRef.current = ORIGIN;
        viewportTopLeftRef.current = ORIGIN;
        lastMousePosRef.current = ORIGIN;
        setIsReset(true);
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

  // setup canvas and set context
  useLayoutEffect(() => {
    reset();
  }, [canvasRef]);

  // pan when offset changes
  useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      );
      context.translate(offsetDiff.x, offsetDiff.y);
      viewportTopLeftRef.current = diffPoints(
        viewportTopLeftRef.current,
        offsetDiff
      );
      setIsReset(false);
    }
  }, [offset]);

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset;
  }, [offset]);

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
      context.arc(
        viewportTopLeftRef.current.x,
        viewportTopLeftRef.current.y,
        5,
        0,
        2 * Math.PI
      );
      context.fillStyle = "red";
      context.fill();
    }
  }, [canvasRef, context, isReset, scale, offset]);

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault();
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: canvasRef.current.offsetLeft,
          y: canvasRef.current.offsetTop,
        };
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
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
      event.preventDefault();
      if (context) {
        const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
        const adjustedOriginDelta = {
          x: (mousePos.x / scale) * (1 - 1 / zoom),
          y: (mousePos.y / scale) * (1 - 1 / zoom),
        };
        const newViewportTopLeft = addPoints(
          viewportTopLeftRef.current,
          adjustedOriginDelta
        );

        context.translate(
          viewportTopLeftRef.current.x,
          viewportTopLeftRef.current.y
        );
        context.scale(zoom, zoom);
        context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

        viewportTopLeftRef.current = newViewportTopLeft;
        setScale(scale * zoom);
        setIsReset(false);
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
