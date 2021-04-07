import React, { useEffect, useRef, useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import {
  run,
  makeNode,
  makeConnection,
  ModelOutput,
  TempOutput,
} from "hotstuff-network";
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

function runModel() {
  const firstNode = makeNode({
    name: "first",
    temperatureDegC: 10,
    capacitanceJPerDegK: 100,
    powerGenW: 0,
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

  const start = performance.now();
  const results = run({
    nodes: [firstNode, secondNode, thirdNode],
    connections: [conn12, conn23, conn31],
    timeStepS: 0.1,
    totalTimeS: 100,
  });
  const end = performance.now();

  console.log(JSON.stringify(results, null, 2));
  console.log(`Model took ${end - start} ms`);

  return results;
}

function getTempRange(nodeTemps: TempOutput[]): number[] {
  const range = [0, 0];
  nodeTemps.forEach((temps) => {
    const min = Math.min(...temps.tempDegC);
    const max = Math.max(...temps.tempDegC);
    if (min < range[0]) {
      range[0] = min;
    }
    if (max > range[1]) {
      range[1] = max;
    }
  });
  return range;
}

export default function App() {
  const plotRef = useRef<null | SVGSVGElement>(null);
  const [results, setResults] = useState<ModelOutput | undefined>(undefined);
  const [plot, setPlot] = useState<null | d3.Selection<
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
      left: 100,
      right: 100,
      top: 100,
      bottom: 100,
    },
  };

  // run model once on load
  useEffect(() => {
    const results = runModel();
    setResults(results);
  }, []);

  // plot
  useEffect(() => {
    if (results === undefined) {
      return;
    } else if (!plot) {
      setPlot(d3.select(plotRef.current));
      return;
    }

    const [dataMin, dataMax] = getTempRange(results.temps);

    // add margin
    const innerContent = plot
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
      .domain([0, results.totalTimeS])
      .range([0, plotParams.width]);
    const xAxis = d3.axisBottom(scaleX);

    const scaleY = d3
      .scaleLinear()
      .domain([dataMin, dataMax])
      .range([plotParams.height, 0]);
    const yAxis = d3.axisLeft(scaleY);

    // xAxis
    innerContent
      .append("g")
      .attr("transform", `translate(0, ${plotParams.height})`)
      .call(xAxis)
      .append("text")
      .text("Time [seconds]")
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .attr(
        "x",
        plotParams.margin.left +
          (plotParams.width -
            plotParams.margin.left -
            plotParams.margin.right) /
            2
      )
      .attr("y", 50); // Relative to the x axis.

    // yAxis
    innerContent
      .append("g")
      .call(yAxis)
      .append("text")
      .text("Temperature [degC]")
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr(
        "x",
        -(
          plotParams.margin.top +
          (plotParams.height -
            plotParams.margin.top -
            plotParams.margin.bottom) /
            2
        )
      )
      .attr("y", -50); // Relative to the y axis.

    const lineGen = d3
      .line()
      .x((d) => scaleX(d[0]))
      .y((d) => scaleY(d[1]))
      .curve(d3.curveMonotoneX);

    // plot data
    results.temps.map((temps) => {
      const data: [number, number][] = temps.tempDegC.map((val, idx) => [
        idx * results.timeStepS,
        val,
      ]);
      const lineData = lineGen(data);
      console.log(data);
      console.log(lineData);
      if (!!lineData) {
        innerContent
          .append("path")
          .attr("fill", "none")
          .attr("d", lineData)
          .attr("stroke", "steelblue");
        // .attr("stroke-linejoin", "round")
        // .attr("stroke-linecap", "round")
        // .attr("stroke-width", 1.5);
      }
    });
  }, [plot, results]);

  return (
    <div>
      <svg ref={plotRef} />
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
  // return <Canvas nodes={nodes} addNode={addNode} />;
}
