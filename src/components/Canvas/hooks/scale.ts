import { RefObject, useState } from "react";
import useEventListener from "./useEventListener";

type ScaleOpts = {
  direction: "up" | "down";
  interval: number;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export default function useScale(
  ref: RefObject<HTMLElement | null>,
  interval: number
) {
  const [scale, setScale] = useState(1);

  const updateScale = ({ direction, interval }: ScaleOpts) => {
    setScale((currentScale) => {
      // Adjust up to or down to the maximum or minimum scale levels by `interval`.
      if (direction === "up") {
        if (currentScale + interval < MAX_SCALE) {
          return currentScale + interval;
        } else {
          return MAX_SCALE;
        }
      } else if (direction === "down") {
        if (currentScale - interval > MIN_SCALE) {
          return currentScale - interval;
        } else {
          MIN_SCALE;
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
  return scale;
}
