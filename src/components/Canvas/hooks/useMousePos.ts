import { useState, useLayoutEffect, RefObject, useRef } from "react";
import { Point } from "../pointUtils";

export default function useMousePos(ref: RefObject<HTMLElement | null>) {
  const mousePosRef = useRef<Point>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    function handleMouseMove(event: MouseEvent) {
      if (ref.current) {
        mousePosRef.current = {
          x: event.clientX - ref.current.offsetLeft,
          y: event.clientY - ref.current.offsetTop,
        };
      }
    }

    // function handleWheel(event: WheelEvent) {
    //   if (ref.current) {
    //     const boundingRect = ref.current.getBoundingClientRect();
    //     mousePosRef.current = {
    //       x: event.clientX + boundingRect.left,
    //       y: event.clientY + boundingRect.bottom,
    //     };
    //   }
    // }

    const node = ref.current;
    node.addEventListener("mousemove", handleMouseMove);
    // node.addEventListener("wheel", handleWheel);
    return () => {
      node.removeEventListener("mousemove", handleMouseMove);
      // node.removeEventListener("wheel", handleWheel);
    };
  }, [ref]);

  return mousePosRef;
}
