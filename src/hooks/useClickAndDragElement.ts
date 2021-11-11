import * as React from "react";

export default function useClickAndDragElement(
  ref: React.RefObject<HTMLElement>,
  onDragX: () => void,
  onDragY: () => void
): void {
  const elem = ref.current;

  if (elem !== null) {
    const onMouseUp = (mouseUpEvent: React.MouseEvent | MouseEvent) => {
      elem.removeEventListener("mousemove", onMouseMove);
      elem.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (mouseMoveEvent: React.MouseEvent | MouseEvent) => {
      onDragX();
      onDragY();
    };

    const onMouseDown = (mouseDownEvent: React.MouseEvent | MouseEvent) => {
      elem.addEventListener("mousemove", onMouseMove);
      elem.addEventListener("mouseup", onMouseUp);
    };

    elem.addEventListener("mousedown", onMouseDown);
  }
}
