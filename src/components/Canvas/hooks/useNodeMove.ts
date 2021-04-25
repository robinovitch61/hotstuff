import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { addPoints, diffPoints, ORIGIN, Point } from "../pointUtils";

export default function useNodeMove(): [
  Point,
  (e: SyntheticMouseEvent) => void
] {
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const lastMousePos = useRef(ORIGIN);

  const mouseMove = useCallback((e: MouseEvent) => {
    const lastPoint = lastMousePos.current;
    const currMousePos = { x: e.pageX, y: e.pageY }; // page is for the document, https://jsfiddle.net/robinovitch61/eL9q10zj/
    lastMousePos.current = currMousePos;

    // want only the incremental change on each mouse motion
    // to adjust the node center by
    setOffset(diffPoints(lastPoint, currMousePos));
  }, []);

  // Tear down listeners.
  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  // Set up listeners.
  const startMouseMove = useCallback(
    (e: SyntheticMouseEvent) => {
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
      lastMousePos.current = { x: e.pageX, y: e.pageY };
    },
    [mouseMove, mouseUp]
  );

  return [offset, startMouseMove];
}
