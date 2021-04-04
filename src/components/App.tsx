import React, { useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";

export type Point = {
  xPos: number;
  yPos: number;
};

export type HotNode = {
  topLeftCorner: Point;
  bottomRightCorner: Point;
  shape: "Circle" | "Rectangle";
  thermalCapacitance: Qty;
  temperature: Qty;
  isBoundary: boolean;
};

export default function App() {
  const nodes: HotNode[] = [];

  function addNode(node: HotNode) {
    nodes.push(node);
  }

  return <Canvas nodes={nodes} addNode={addNode} />;
}
