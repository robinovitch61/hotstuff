import {RefObject, useState} from 'react';
import useEventListener from './useEventListener';

type ScaleOpts = {
  direction: 'up' | 'down'
  interval: number
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export default function useScale(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);

  const updateScale = ({direction, interval}: ScaleOpts) => {
    setScale(currentScale => {
      let scale: number;
      // Adjust up to or down to the maximum or minimum scale levels by `interval`.
      if (direction === 'up') {
        if (currentScale + interval < MAX_SCALE) {
          scale = currentScale + interval;
        } else {
          scale = MAX_SCALE;
        }
      } else if (direction === 'down') {
        if (currentScale - interval > MIN_SCALE) {
          scale = currentScale - interval;
        } else {
          scale = MIN_SCALE;
        }
      } else {
        scale = currentScale;
      }
      return scale;
    });
  };

  // Set up an event listener such that on `wheel`, we call `updateScale`.
  useEventListener(ref, 'wheel', e => {
    e.preventDefault();
    updateScale({
      direction: e.deltaY > 0 ? 'up' : 'down',
      interval: 0.1
    });
  });
  return scale;
}