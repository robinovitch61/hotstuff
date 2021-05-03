import * as React from "react";
import { useLayoutEffect, RefObject, useState } from "react";
import { diffPoints, Point } from "../pointUtils";

export default function useMousePos(
  ref: RefObject<HTMLElement | null>
): [Point, React.Dispatch<React.SetStateAction<Point>>] {
  // const mousePosRef = useRef<Point>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  // add event listener on canvas for mouse position
  useLayoutEffect(() => {
    const canvasElem = ref.current;
    if (canvasElem === null) {
      return;
    }

    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault();
      if (ref.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: ref.current.offsetLeft,
          y: ref.current.offsetTop,
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
  }, [ref]);

  return [mousePos, setMousePos];
}
