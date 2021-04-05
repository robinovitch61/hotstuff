import React, { useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import * as hs from "hotstuff-network";

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

const firstNode = hs.makeNode({
  name: "first",
  temperatureDegC: 10,
  capacitanceJPerDegK: 10000,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = hs.makeNode({
  name: "second",
  temperatureDegC: 40,
  capacitanceJPerDegK: 40000,
  powerGenW: -10,
  isBoundary: true,
});

const connection: hs.Connection = {
  source: firstNode,
  target: secondNode,
  resistanceDegKPerW: 100,
  kind: "bi",
};

export default function App() {
  const results = hs.run({
    nodes: [firstNode, secondNode],
    connections: [connection],
    timestepS: 0.01,
    runTimeS: 0.03,
  });
  console.log(JSON.stringify(results, null, 2));

  const nodes: HotNode[] = [];

  function addNode(node: HotNode) {
    nodes.push(node);
  }

  return <Canvas nodes={nodes} addNode={addNode} />;
}
