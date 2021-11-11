import * as React from "react";
import { useEffect } from "react";

export default function useOnClickOutside(
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: () => void
): void {
  useEffect(() => {
    const listener = (
      event: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent
    ) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node | null)) {
        return;
      }
      onClickOutside();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, onClickOutside]);
}
