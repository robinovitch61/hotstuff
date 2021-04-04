import {
  MouseEvent as SyntheticMouseEvent,
  RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { HotNode, Point } from "../../App";
import Qty from "js-quantities";

export default function useNodes(
  startNodes: HotNode[]
): [HotNode[], (e: SyntheticMouseEvent) => void] {
  const [nodes, setNodes] = useState<HotNode[]>(startNodes);

  const addNode = (e: SyntheticMouseEvent) =>
    setNodes([
      ...nodes,
      {
        topLeftCorner: { xPos: e.pageX, yPos: e.pageY },
        bottomRightCorner: { xPos: e.pageX + 10, yPos: e.pageY + 10 },
        shape: "Circle",
        thermalCapacitance: Qty("10 J/degK"),
        temperature: Qty("10 degC"),
        isBoundary: false,
      },
    ]);

  return [nodes, addNode];
}
