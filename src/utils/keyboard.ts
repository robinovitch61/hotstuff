import React from "react";
import { AppNode } from "../App";

export default function setUpKeyboardListener(
  setAppNodes: React.Dispatch<React.SetStateAction<AppNode[]>>
): void {
  document.addEventListener(
    "keydown",
    (event: React.KeyboardEvent | KeyboardEvent) => {
      // console.log(
      //   `Key: ${event.key} with keycode ${event.keyCode} has been pressed`
      // );
      if (event.metaKey) {
        if (event.keyCode === 65) {
          event.preventDefault();
          setAppNodes((prevNodes) =>
            prevNodes.map((node) => {
              return { ...node, isActive: true };
            })
          );
        }
      }
    }
  );
}
