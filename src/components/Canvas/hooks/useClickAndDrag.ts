import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useState,
} from "react";
import { ORIGIN, Point } from "../pointUtils";

export default function useClickAndDrag(): [
  Point,
  boolean,
  (e: SyntheticMouseEvent) => void
] {
  const [mousePos, setMousePos] = useState<Point>(ORIGIN);
  const [isMouseUp, setIsMouseUp] = useState(false);

  const mouseMove = useCallback((e: MouseEvent) => {
    const currMousePos = { x: e.clientX, y: e.clientY }; // page is for the document, https://jsfiddle.net/robinovitch61/eL9q10zj/
    setMousePos(currMousePos);
  }, []);

  const mouseUp = useCallback(() => {
    setIsMouseUp(true);
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startMouseMove = useCallback(
    (e: SyntheticMouseEvent) => {
      setIsMouseUp(false);
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
      setMousePos({ x: e.pageX, y: e.pageY });
    },
    [mouseMove, mouseUp]
  );

  return [mousePos, isMouseUp, startMouseMove];
}
