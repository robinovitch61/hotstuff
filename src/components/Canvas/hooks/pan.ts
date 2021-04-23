import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { ORIGIN, Point } from "../pointUtils";

/**
 * Track the user's intended panning offset by listening to `mousemove` events
 * once the user has started panning.
 */
export default function usePan(): [Point, (e: SyntheticMouseEvent) => void] {
  const [panState, setPanState] = useState<Point>(ORIGIN);

  // Track the last observed mouse position on pan.
  const lastPointRef = useRef(ORIGIN);

  const pan = useCallback((e: MouseEvent) => {
    const lastPoint = lastPointRef.current;
    const point = { x: e.pageX, y: e.pageY };
    lastPointRef.current = point;

    // Find the delta between the last mouse position on `mousemove` and the
    // current mouse position.
    //
    // Then, apply that delta to the current pan offset and set that as the new
    // state.
    setPanState((panState) => {
      const delta = {
        x: lastPoint.x - point.x,
        y: lastPoint.y - point.y,
      };
      const offset = {
        x: panState.x + delta.x,
        y: panState.y + delta.y,
      };

      return offset;
    });
  }, []);

  // Tear down listeners.
  const endPan = useCallback(() => {
    document.removeEventListener("mousemove", pan);
    document.removeEventListener("mouseup", endPan);
  }, [pan]);

  // Set up listeners.
  const startPan = useCallback(
    (e: SyntheticMouseEvent) => {
      document.addEventListener("mousemove", pan);
      document.addEventListener("mouseup", endPan);
      lastPointRef.current = { x: e.pageX, y: e.pageY };
    },
    [pan, endPan]
  );

  return [panState, startPan];
}
