import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { addPoints, diffPoints, ORIGIN, Point } from "../pointUtils";

/**
 * Track the user's intended panning offset by listening to `mousemove` events
 * once the user has started panning.
 */
export default function usePan(): [
  Point,
  React.Dispatch<React.SetStateAction<Point>>,
  (e: SyntheticMouseEvent) => void
] {
  const [offset, setOffset] = useState<Point>(ORIGIN);

  // Track the last observed mouse position on pan.
  const lastMousePos = useRef(ORIGIN);

  const mouseMove = useCallback((e: MouseEvent) => {
    const lastPoint = lastMousePos.current;
    const currMousePos = { x: e.pageX, y: e.pageY }; // page is for the document, https://jsfiddle.net/robinovitch61/eL9q10zj/
    lastMousePos.current = currMousePos;

    // Find the delta between the last mouse position on `mousemove` and the
    // current mouse position.
    //
    // Then, apply that delta to the current pan offset and set that as the new
    // state.
    setOffset((prevOffset) => {
      const delta = diffPoints(lastPoint, currMousePos);
      return addPoints(prevOffset, delta);
    });
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

  return [offset, setOffset, startMouseMove];
}
