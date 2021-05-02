import { RefObject, useState } from "react";
import useEventListener from "./useEventListener";

type ScaleOpts = {
  direction: "up" | "down";
  interval: number;
};

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export default function useScale(
  ref: RefObject<HTMLElement | null>,
  interval: number,
  minScale: number,
  maxScale: number
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [scale, setScale] = useState(1);

  const updateScale = ({ direction, interval }: ScaleOpts) => {
    setScale((currentScale) => {
      // Adjust up to or down to the maximum or minimum scale levels by `interval`.
      if (direction === "up") {
        if (currentScale + interval < maxScale) {
          return currentScale + interval;
        } else {
          return maxScale;
        }
      } else if (direction === "down") {
        if (currentScale - interval > minScale) {
          return currentScale - interval;
        } else {
          return minScale;
        }
      }
      return currentScale;
    });
  };

  // Set up an event listener such that on `wheel`, we call `updateScale`.
  useEventListener(ref, "wheel", (e) => {
    e.preventDefault();
    updateScale({
      direction: e.deltaY > 0 ? "down" : "up",
      interval,
    });
  });
  return [scale, setScale];
}
