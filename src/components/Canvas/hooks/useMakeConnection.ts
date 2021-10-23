import {
  MouseEvent as SyntheticMouseEvent,
  useCallback,
  useState,
} from "react";
import { ORIGIN, Point } from "../../../pointUtils";

export default function useMakeConnection(): [
  Point,
  boolean,
  (e: SyntheticMouseEvent) => void,
  React.Dispatch<React.SetStateAction<boolean>>
] {
  const [mousePos, setMousePos] = useState<Point>(ORIGIN);
  const [isConnecting, setIsConnecting] = useState(false);

  const mouseMove = useCallback((e: MouseEvent) => {
    const currMousePos = { x: e.pageX, y: e.pageY }; // page is for the document, https://jsfiddle.net/robinovitch61/eL9q10zj/
    setMousePos(currMousePos);
  }, []);

  const startMakeConnection = useCallback(
    (e: SyntheticMouseEvent) => {
      setIsConnecting(true);
      document.addEventListener("mousemove", mouseMove);
      setMousePos({ x: e.pageX, y: e.pageY });
    },
    [mouseMove]
  );

  return [mousePos, isConnecting, startMakeConnection, setIsConnecting];
}
