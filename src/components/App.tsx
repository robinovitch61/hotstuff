import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import * as JSON5 from "json5";
import {
  run,
  makeNode,
  makeConnection,
  ModelOutput,
  NodeResult,
  HSNode,
  HSConnection,
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
  Label,
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

const MAX_PLOT_POINTS_PER_NODE = 400;
const DEFAULT_TIMESTEP = 0.1;
const DEFAULT_TOTAL_TIME = 120;
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
    "capacitanceJPerDegK": 8,
    "powerGenW": 10,
    "isBoundary": false
  },
]`;
const DEFAULT_CONNECTIONS = `[
  {
    source: "first",
    target: "second",
    resistanceDegKPerW: 0.1,
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

const StyledCharts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 2em 0;

  .chart {
    width: 70% !important;

    @media only screen and (max-width: 600px) {
      width: 95% !important;
    }
  }
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

function getTempRange(nodeTemps: NodeResult[]): number[] {
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
  const [connections, setConnections] = useState<HSConnection[]>(
    parseTextToConnections(parseTextToNodes(DEFAULT_NODES), DEFAULT_CONNECTIONS)
  );
  const [connectionText, setConnectionText] = useState(DEFAULT_CONNECTIONS);
  const [plot, setPlot] = useState<null | d3.Selection<
    SVGSVGElement | null,
    unknown,
    null,
    undefined
  >>(null);

  // update both nodes and connections on text update
  useEffect(() => {
    const nodes = parseTextToNodes(nodeText);
    setNodes(nodes);
    const connections = parseTextToConnections(nodes, connectionText);
    setConnections(connections);
  }, [nodeText, connectionText]);

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

  function parseTextToConnections(
    nodes: HSNode[],
    text: string
  ): HSConnection[] {
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
    height: 350,
    margin: {
      left: 40,
      right: 40,
      top: 40,
      bottom: 40,
    },
  };

  function plotShape(data: ModelOutput): [any[], any[]] {
    const lowerMag = Math.floor(Math.log10(data.totalTimeS));
    const divisibleBy = Math.pow(10, lowerMag - 1);

    function include(val: number) {
      return Math.abs(val % divisibleBy) === 0;
    }

    const includeAll = data.timeSeriesS.length < MAX_PLOT_POINTS_PER_NODE;
    const temps: any[] = [];
    const heatTransfers: any[] = [];
    data.timeSeriesS.forEach((t, idx) => {
      if (includeAll || include(t)) {
        const temp: any = { name: t };
        const ht: any = { name: t };
        data.nodeResults.forEach((nodeResult) => {
          temp[nodeResult.node.name] = nodeResult.tempDegC[idx];
        });
        data.connectionResults.forEach((connectionResult) => {
          ht[
            `${connectionResult.connection.source.name} to ${connectionResult.connection.target.name}`
          ] = connectionResult.heatTransferW[idx];
        });
        temps.push(temp);
        heatTransfers.push(ht);
      }
    });
    return [temps, heatTransfers];
  }

  const [tempPlotData, heatTransferPlotData] =
    !!results && results.nodeResults.length > 0 ? plotShape(results) : [[], []];

  return (
    <div>
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
        {!!results && results.nodeResults.length > 0 ? (
          <StyledCharts>
            <ResponsiveContainer height={plotParams.height} className={"chart"}>
              <LineChart
                data={tempPlotData}
                margin={{
                  top: 0,
                  right: plotParams.margin.right,
                  left: plotParams.margin.left,
                  bottom: plotParams.margin.bottom,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Time [seconds]",
                    position: "middle",
                    dy: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Temperature [degC]",
                    position: "middle",
                    angle: -90,
                    dx: -20,
                  }}
                />
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{
                    paddingLeft: "10px",
                  }}
                />
                {results.nodeResults.map((nodeResult, idx) => {
                  return (
                    <Line
                      key={nodeResult.node.id}
                      type={"monotone"}
                      dataKey={nodeResult.node.name}
                      stroke={colors[idx]}
                      activeDot={{ r: 8 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer height={plotParams.height} className={"chart"}>
              <LineChart
                height={plotParams.height}
                data={heatTransferPlotData}
                margin={{
                  top: 0,
                  right: plotParams.margin.right,
                  left: plotParams.margin.left,
                  bottom: plotParams.margin.bottom,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Time [seconds]",
                    position: "middle",
                    dy: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Heat Transfer [Watts]",
                    position: "middle",
                    angle: -90,
                    dx: -20,
                  }}
                />
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{
                    paddingLeft: "10px",
                  }}
                  fontSize={5}
                />
                {results.connectionResults.map((connectionResult, idx) => {
                  return (
                    <Line
                      key={connectionResult.connection.id}
                      type={"monotone"}
                      dataKey={`${connectionResult.connection.source.name} to ${connectionResult.connection.target.name}`}
                      stroke={colors[idx]}
                      activeDot={{ r: 8 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </StyledCharts>
        ) : (
          <h1>Welcome to hotstuff.network</h1>
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
}
