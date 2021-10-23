import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { diffPoints, ORIGIN, Point } from "../../../pointUtils";

export default function useNodeMove(): [
  Point,
  (e: SyntheticMouseEvent) => void
] {
  const [nodeDelta, setNodeDelta] = useState<Point>(ORIGIN);
  const lastMousePos = useRef(ORIGIN);

  const mouseMove = useCallback((e: MouseEvent) => {
    const lastPoint = lastMousePos.current;
    const currMousePos = { x: e.pageX, y: e.pageY }; // page is for the document, https://jsfiddle.net/robinovitch61/eL9q10zj/
    lastMousePos.current = currMousePos;

    setNodeDelta(diffPoints(lastPoint, currMousePos));
  }, []);

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startNodeMove = useCallback(
    (e: SyntheticMouseEvent) => {
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
      lastMousePos.current = { x: e.pageX, y: e.pageY };
    },
    [mouseMove, mouseUp]
  );

  return [nodeDelta, startNodeMove];
}
