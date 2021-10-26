import React, { useEffect } from "react";
import { AppNode } from "../App";

export default function useKeyDown(
  keyboardActive: boolean,
  appNodes: AppNode[],
  setAppNodes: React.Dispatch<React.SetStateAction<AppNode[]>>,
  deleteNodes: (nodeIds: string[]) => void
): void {
  useEffect(() => {
    const onKeyDown = (event: React.KeyboardEvent | KeyboardEvent) => {
      // console.log(
      //   `Key: ${event.key} with keycode ${event.keyCode} has been pressed`
      // );

      if (keyboardActive) {
        // shift + A makes all nodes active
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

        // delete active nodes on back/del
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          deleteNodes(
            appNodes.filter((node) => node.isActive).map((node) => node.id)
          );
        }

        // escape key makes all inactive
        if (event.keyCode === 27) {
          setAppNodes((prevNodes) =>
            prevNodes.map((node) => ({ ...node, isActive: false }))
          );
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [appNodes, deleteNodes, keyboardActive, setAppNodes]);
}
