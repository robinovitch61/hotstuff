import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import * as JSON5 from "json5";
import {
  run,
  makeNode,
  makeConnection,
  ModelOutput,
  TempOutput,
  Node as HSNode,
  Connection,
} from "hotstuff-network";
import * as d3 from "d3";
import styled from "styled-components";

const colors = [
  "#16a085",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
];

const DEFAULT_TIMESTEP = 0.1;

const DEFAULT_TOTAL_TIME = 10;

const DEFAULT_NODES = `[
  {
    "name": "first",
    "temperatureDegC": 120,
    "capacitanceJPerDegK": 200,
    "powerGenW": 0,
    "isBoundary": false
  },
  {
    "name": "second",
    "temperatureDegC": 40,
    "capacitanceJPerDegK": 10,
    "powerGenW": 3,
    "isBoundary": true
  },
  {
    "name": "third",
    "temperatureDegC": -10,
    "capacitanceJPerDegK": 800,
    "powerGenW": 0,
    "isBoundary": false
  },
]`;

const DEFAULT_CONNECTIONS = `[
  {
    source: "first",
    target: "second",
    resistanceDegKPerW: 3,
    kind: "bi",
  },
  {
    source: "second",
    target: "third",
    resistanceDegKPerW: 10,
    kind: "bi",
  },
]`;

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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const StyledFormShortTextInput = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin: 0.5em;
`;

const StyledFormLongTextInput = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin: 0.5em;
`;

const StyledLabelShort = styled.label`
  display: flex;
  width: 400px;
  justify-content: space-between;
`;

const StyledLabelLong = styled.label`
  display: flex;
  width: 600px;
  justify-content: space-between;
`;

const StyledTextArea = styled.textarea`
  width: 80%;
  min-width: 80%;
  max-width: 80%;
  min-height: 200px;
`;

const StyledSubmit = styled.input`
  width: 100px;
  height: 30px;
`;

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

type FormShortTextInputProps = {
  label: string;
  defaultVal?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type FormLongTextInputProps = {
  label: string;
  defaultVal?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function FormShortTextInput(props: FormShortTextInputProps) {
  return (
    <StyledFormShortTextInput>
      <StyledLabelShort>
        {props.label}
        <input
          type="text"
          defaultValue={props.defaultVal}
          onChange={(event) => props.onChange(event)}
        />
      </StyledLabelShort>
    </StyledFormShortTextInput>
  );
}

function FormLongTextInput(props: FormLongTextInputProps) {
  return (
    <StyledFormLongTextInput>
      <StyledLabelLong>
        <div style={{ marginRight: "10px" }}>{props.label}</div>
        <StyledTextArea
          defaultValue={props.defaultVal}
          onChange={(event) => props.onChange(event)}
        />
      </StyledLabelLong>
    </StyledFormLongTextInput>
  );
}

export default function App() {
  const plotRef = useRef<null | SVGSVGElement>(null);
  const [results, setResults] = useState<ModelOutput | undefined>(undefined);
  const [totalTimeS, setTotalTimeS] = useState(DEFAULT_TOTAL_TIME);
  const [timeStepS, setTimeStepS] = useState(DEFAULT_TIMESTEP);
  const [nodes, setNodes] = useState<HSNode[]>(parseTextToNodes(DEFAULT_NODES));
  const [nodeText, setNodeText] = useState(DEFAULT_NODES);
  const [connections, setConnections] = useState<Connection[]>(
    parseTextToConnections(parseTextToNodes(DEFAULT_NODES), DEFAULT_CONNECTIONS)
  );
  const [connectionText, setConnectionText] = useState(DEFAULT_CONNECTIONS);
  const [plot, setPlot] = useState<null | d3.Selection<
    SVGSVGElement | null,
    unknown,
    null,
    undefined
  >>(null);

  function runModel(): ModelOutput {
    const start = performance.now();
    const results = run({
      nodes,
      connections,
      timeStepS,
      totalTimeS,
    });
    const end = performance.now();
    console.log(`Model took ${end - start} ms`);
    return results;
  }

  function parseTextToNodes(text: string): HSNode[] {
    try {
      const parsed = JSON5.parse(text);
      return parsed.map((node: any) =>
        makeNode({
          name: node["name"],
          temperatureDegC: node["temperatureDegC"],
          capacitanceJPerDegK: node["capacitanceJPerDegK"],
          powerGenW: node["powerGenW"],
          isBoundary: node["isBoundary"],
        })
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function parseTextToConnections(nodes: HSNode[], text: string): Connection[] {
    try {
      const parsed = JSON5.parse(text);
      return parsed.map((conn: any) => {
        const sourceNode = nodes.filter(
          (node) => node.name === conn["source"]
        )[0];
        const targetNode = nodes.filter(
          (node) => node.name === conn["target"]
        )[0];
        return makeConnection({
          source: sourceNode,
          target: targetNode,
          resistanceDegKPerW: conn["resistanceDegKPerW"],
          kind: conn["bi"],
        });
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  // show the temps of the first node as dots vertically along the svg
  const plotParams = {
    width: 700,
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
    setPlot(d3.select(plotRef.current));
    const results = runModel();
    setResults(results);
  }, []);

  // update both nodes and connections on text update
  useEffect(() => {
    const nodes = parseTextToNodes(nodeText);
    setNodes(nodes);
    const connections = parseTextToConnections(nodes, connectionText);
    setConnections(connections);
  }, [nodeText, connectionText]);

  // plot
  useEffect(() => {
    if (results === undefined) {
      return;
    } else if (!plot) {
      setPlot(d3.select(plotRef.current));
      return;
    }

    const [dataMin, dataMax] = getTempRange(results.temps);

    // add margin around plot
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
    results.temps.map((temps, lineNum) => {
      const data: [number, number][] = temps.tempDegC.map((val, idx) => [
        idx * results.timeStepS,
        val,
      ]);
      const lineData = lineGen(data);

      if (!!lineData) {
        const color = colors[lineNum];
        const isAscending = data[1][1] - data[0][1] > 0;

        // TODO: Add rect behind text for easier reading
        innerContent
          .append("text")
          .text(results.temps[lineNum].node.name)
          .attr("fill", color)
          .attr("x", 5)
          .attr("y", scaleY(data[0][1]) + (isAscending ? -15 : 15));

        innerContent
          .append("path")
          .attr("fill", "none")
          .attr("d", lineData)
          .attr("stroke", color)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5);
      }
    });
  }, [plot, results]);

  return (
    <div>
      {/*<pre>{JSON.stringify(nodes, null, 2)}</pre>*/}
      {/*<pre>{JSON.stringify(connections, null, 2)}</pre>*/}
      <StyledForm
        onSubmit={(event) => {
          try {
            setResults(runModel());
          } catch (e) {
            console.error(e);
          }
          event.preventDefault();
        }}
      >
        <svg ref={plotRef} />
        <StyledSubmit type="submit" value="Go" />
        <FormShortTextInput
          label={"Time Step [seconds]"}
          defaultVal={DEFAULT_TIMESTEP}
          onChange={(event) => setTimeStepS(parseFloat(event.target.value))}
        />
        <FormShortTextInput
          label={"Total Run Time [seconds]"}
          defaultVal={DEFAULT_TOTAL_TIME}
          onChange={(event) => setTotalTimeS(parseFloat(event.target.value))}
        />
        <FormLongTextInput
          label={"Nodes"}
          defaultVal={DEFAULT_NODES}
          onChange={(event) => setNodeText(event.target.value)}
        />
        <FormLongTextInput
          label={"Connections"}
          defaultVal={DEFAULT_CONNECTIONS}
          onChange={(event) => setConnectionText(event.target.value)}
        />
      </StyledForm>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
  // return <Canvas nodes={nodes} addNode={addNode} />;
}

// function runModel() {
//   const firstNode = makeNode({
//     name: "first",
//     temperatureDegC: 10,
//     capacitanceJPerDegK: 100,
//     powerGenW: 0,
//     isBoundary: false,
//   });
//
//   const secondNode = makeNode({
//     name: "second",
//     temperatureDegC: 40,
//     capacitanceJPerDegK: 40,
//     powerGenW: 0,
//     isBoundary: false,
//   });
//
//   const thirdNode = makeNode({
//     name: "third",
//     temperatureDegC: 120,
//     capacitanceJPerDegK: 200,
//     powerGenW: 0,
//     isBoundary: false,
//   });
//
//   const conn12 = makeConnection({
//     source: firstNode,
//     target: secondNode,
//     resistanceDegKPerW: 1,
//     kind: "bi",
//   });
//
//   const conn23 = makeConnection({
//     source: secondNode,
//     target: thirdNode,
//     resistanceDegKPerW: 2,
//     kind: "bi",
//   });
//
//   const conn31 = makeConnection({
//     source: thirdNode,
//     target: firstNode,
//     resistanceDegKPerW: 3,
//     kind: "bi",
//   });
//
//   const start = performance.now();
//   const results = run({
//     nodes: [firstNode, secondNode, thirdNode],
//     connections: [conn12, conn23, conn31],
//     timeStepS: 0.1,
//     totalTimeS: 100,
//   });
//   const end = performance.now();
//
//   console.log(JSON.stringify(results, null, 2));
//   console.log(`Model took ${end - start} ms`);
//
//   return results;
// }
