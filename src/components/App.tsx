import React, { useEffect, useRef, useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import { run, makeNode, makeConnection } from "hotstuff-network";
import * as d3 from "d3";

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

const firstNode = makeNode({
  name: "first",
  temperatureDegC: 10,
  capacitanceJPerDegK: 100,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = makeNode({
  name: "second",
  temperatureDegC: 40,
  capacitanceJPerDegK: 40,
  powerGenW: 0,
  isBoundary: false,
});

const thirdNode = makeNode({
  name: "third",
  temperatureDegC: 120,
  capacitanceJPerDegK: 200,
  powerGenW: 0,
  isBoundary: false,
});

const conn12 = makeConnection({
  source: firstNode,
  target: secondNode,
  resistanceDegKPerW: 1,
  kind: "bi",
});

const conn23 = makeConnection({
  source: secondNode,
  target: thirdNode,
  resistanceDegKPerW: 2,
  kind: "bi",
});

const conn31 = makeConnection({
  source: thirdNode,
  target: firstNode,
  resistanceDegKPerW: 3,
  kind: "bi",
});

const results = run({
  nodes: [firstNode, secondNode, thirdNode],
  connections: [conn12, conn23, conn31],
  timeStepS: 0.1,
  totalTimeS: 10,
});

console.log(JSON.stringify(results, null, 2));

export default function App() {
  const plotRef = useRef<null | SVGSVGElement>(null);
  const [selection, setSelection] = useState<null | d3.Selection<
    SVGSVGElement | null,
    unknown,
    null,
    undefined
  >>(null);
  const nodes: HotNode[] = [];

  // show the temps of the first node as dots vertically along the svg
  const plotParams = {
    width: 600,
    height: 400,
    margin: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 20,
    },
  };
  const data = results.temps[0].tempDegC;
  const [dataMin, dataMax] = d3.extent(data);
  if (dataMin === undefined || dataMax === undefined) {
    throw Error("data wack yo");
  }

  useEffect(() => {
    if (!selection) {
      setSelection(d3.select(plotRef.current));
    } else {
      // add margin
      const innerContent = selection
        .attr(
          "width",
          plotParams.width + plotParams.margin.left + plotParams.margin.right
        )
        .attr(
          "height",
          plotParams.height + plotParams.margin.top + plotParams.margin.bottom
        )
        .append("g")
        .attr(
          "transform",
          `translate(${plotParams.margin.left}, ${plotParams.margin.top})`
        );

      const scaleX = d3
        .scaleLinear()
        .domain([0, data.length])
        .range([0, plotParams.width]);
      const xAxis = d3.axisBottom(scaleX);

      const scaleY = d3
        .scaleLinear()
        .domain([dataMin, dataMax])
        .range([plotParams.height, 0]);
      const yAxis = d3.axisLeft(scaleY);

      // add axis
      const xAxisGroup = innerContent
        .append("g")
        .attr("transform", `translate(0, ${plotParams.height})`)
        .call(xAxis);
      const yAxisGroup = innerContent.append("g").call(yAxis);

      // plot data
      innerContent
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 1)
        .attr("cy", (d) => scaleY(d))
        .attr("cx", (_, idx) => scaleX(idx));
    }
  }, [selection]);

  return (
    <div>
      <svg ref={plotRef} />
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
  // return <Canvas nodes={nodes} addNode={addNode} />;
}
