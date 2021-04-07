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
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

  function plotShape(data: ModelOutput) {
    const reshaped: any[] = data.timeSeriesS.map((t) => ({ name: t }));
    data.temps.map((nodeTemp) => {
      nodeTemp.tempDegC.forEach((t, idx) => {
        reshaped[idx][nodeTemp.node.name] = t;
      });
    });
    console.log(reshaped);
    return reshaped;
  }

  return (
    <div>
      <pre>{JSON.stringify(nodes, null, 2)}</pre>
      <pre>{JSON.stringify(connections, null, 2)}</pre>
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
        {!!results && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={plotShape(results)}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {results.temps.map((nodeTemps, idx) => {
                return (
                  <Line
                    type={"monotone"}
                    dataKey={nodeTemps.node.name}
                    stroke={colors[idx]}
                    activeDot={{ r: 8 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
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
