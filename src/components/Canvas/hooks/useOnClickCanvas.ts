import * as React from "react";
import { useEffect } from "react";

export default function useOnClickCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  onClickCanvas: React.Dispatch<React.SetStateAction<boolean>>
): void {
  useEffect(() => {
    const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
      const keyBoardActive =
        !!ref.current && ref.current.contains(event.target as Node);
      onClickCanvas(keyBoardActive);
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickCanvas]);
}
