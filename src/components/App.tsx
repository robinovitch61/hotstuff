import React, {useState} from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import Qty from 'js-quantities'; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import * as R from 'ramda';
import Canvas from "./Canvas/Canvas";

export type Point = {
  xPos: number,
  yPos: number
}

export type HotNode = {
  topLeftCorner: Point,
  bottomRightCorner: Point,
  shape: 'Circle' | 'Rectangle',
  thermalCapacitance: Qty,
  temperature: Qty,
  isBoundary: boolean,
}

export default function App() {
  const [nodes, updateNodes] = useState<HotNode[]>([]);

  function addNode(node: HotNode) {
    updateNodes([...nodes, node]);
  }

  return (
      <Canvas nodes={nodes} addNode={addNode}/>
  );
};
