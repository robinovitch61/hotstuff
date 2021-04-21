import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Qty from "js-quantities"; // https://github.com/gentooboontoo/js-quantities/blob/master/src/quantities/definitions.js
import Canvas from "./Canvas/Canvas";
import * as JSON5 from "json5";
import {
  run,
  makeNode,
  makeConnection,
  ModelOutput,
  HSNode,
  HSConnection,
  emptyOutput,
} from "hotstuff-network";
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
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
  "#e67e22",
  "#34495e",
  "#16a085",
];

const MAX_PLOT_POINTS_PER_NODE = 400;
const DEFAULT_TIMESTEP = 0.1;
const DEFAULT_TOTAL_TIME = 50;
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
    "powerGenW": 0,
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
    source: "first",
    target: "third",
    resistanceDegKPerW: 0.5,
    kind: "uni",
  },
  {
    source: "second",
    target: "third",
    resistanceDegKPerW: 3,
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

const StyledTitle = styled.h1`
  width: 100%;
  text-align: center;
  padding: 1em 0 0.5em 0;
  margin: 0;

  &&:before,
  &&:after {
    content: "🔥";
  }
`;

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
  margin-top: 2em;

  .chart {
    width: 60% !important;
    max-width: 900px;

    @media only screen and (max-width: 600px) {
      width: 90% !important;
      touch-action: pan-y;
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
  max-width: 400px;
  width: 95%;
  justify-content: space-between;
`;

const StyledLabelLong = styled.label`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: 95%;
  align-items: center;
`;

const StyledTextArea = styled.textarea`
  width: 80%;
  min-width: 80%;
  max-width: 80%;
  min-height: 200px;
`;

const StyledSubmit = styled.input`
  display: flex;
  align-items: center;
  -webkit-appearance: none;
  border: none;
  border-radius: 10px;
  padding: 0.8em 3em;
  margin: 1em;
  font-size: 1.2em;
  background: #dbdbdb;

  &&:hover {
    cursor: pointer;
  }
`;

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

function adjustTextAreaHeight(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

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
          onInput={(event) =>
            adjustTextAreaHeight(event.target as HTMLTextAreaElement)
          }
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

  // update both nodes and connections on text update
  useEffect(() => {
    const nodes = parseTextToNodes(nodeText);
    setNodes(nodes);
    const connections = parseTextToConnections(nodes, connectionText);
    setConnections(connections);
  }, [nodeText, connectionText]);

  function runModel(): ModelOutput {
    const results = run({
      nodes,
      connections,
      timeStepS,
      totalTimeS,
    });
    if (results.errors) {
      // TODO: minification removes err.name
      results.errors.map((err) => console.error(`${err.name}: ${err.message}`));
    }
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
      left: 5,
      right: 5,
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

  const res =
    !!results && results.nodeResults.length > 0 ? results : emptyOutput;
  const [tempPlotData, heatTransferPlotData] = plotShape(res);

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
        {res.timeSeriesS.length > 0 ? (
          <>
            <StyledTitle>
              {`Completed in ${res.computeTimeS.toFixed(2)} seconds`}
            </StyledTitle>
            <StyledCharts>
              <ResponsiveContainer
                height={plotParams.height}
                className={"chart"}
              >
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
                  {res.nodeResults.map((nodeResult, idx) => {
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
              <ResponsiveContainer
                height={plotParams.height}
                className={"chart"}
              >
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
                  {res.connectionResults.map((connectionResult, idx) => {
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
          </>
        ) : (
          <StyledTitle>Welcome to hotstuff.network</StyledTitle>
        )}
        <StyledSubmit type="submit" value="Go" />
        <FormShortTextInput
          label={"Timestep[sec]"}
          defaultVal={DEFAULT_TIMESTEP}
          onChange={(event) => setTimeStepS(parseFloat(event.target.value))}
        />
        <FormShortTextInput
          label={"Run Time [sec]"}
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
      {/*<pre>{JSON.stringify(results, null, 2)}</pre>*/}
    </div>
  );
}
