import { useLayoutEffect, RefObject, useState } from "react";
import { diffPoints, ORIGIN, Point } from "../../../pointUtils";

export default function useMousePos(ref: RefObject<HTMLElement | null>): Point {
  const [mousePos, setMousePos] = useState<Point>(ORIGIN);

  // add event listener on canvas for mouse position
  useLayoutEffect(() => {
    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault();
      if (ref.current) {
        const viewportMousePos = { x: event.pageX, y: event.pageY };
        const boundingRect = ref.current.getBoundingClientRect();
        const topLeftCanvasPos = { x: boundingRect.left, y: boundingRect.top };
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
      }
    }

    document.addEventListener("mousemove", handleUpdateMouse);
    return () => {
      document.removeEventListener("mousemove", handleUpdateMouse);
    };
  }, [ref]);

  return mousePos;
}
