import { useLayoutEffect, useState } from "react";

export default function useWindowSize(): [[number, number], number] {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const [ratio, setRatio] = useState(1);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    function updateRatio() {
      const { devicePixelRatio: ratio = 1 } = window;
      setRatio(ratio);
    }
    window.addEventListener("resize", updateSize);
    window.addEventListener("resize", updateRatio);
    updateSize();
    updateRatio();
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("resize", updateRatio);
    };
  }, []);
  return [size, ratio];
}
