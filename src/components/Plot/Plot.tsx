import * as React from "react";
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
import styled from "styled-components";
import { emptyOutput, ModelOutput } from "hotstuff-network";

const MAX_PLOT_POINTS_PER_NODE = 400;
const colors = [
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
  "#e67e22",
  "#34495e",
  "#16a085",
];

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

{
  /*  */
}

const StyledPlot = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
  border-top: 3px solid black;
  margin: 0;
  padding: 0;
`;

type Margin = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type PlotProps = {
  height: number;
  margin: Margin;
  modelOutput?: ModelOutput;
};

type PlotDataForTime = {
  time: number;
  [key: string]: number;
};

export default function Plot(props: PlotProps): React.ReactElement {
  // show the temps of the first node as dots vertically along the svg
  const plotParams = {
    height: props.height,
    margin: props.margin,
  };

  function plotShape(
    data: ModelOutput
  ): [PlotDataForTime[], PlotDataForTime[]] {
    const lowerMag = Math.floor(Math.log10(data.totalTimeS));
    const divisibleBy = Math.pow(10, lowerMag - 1);

    function include(val: number) {
      return Math.abs(val % divisibleBy) === 0;
    }

    const includeAll = data.timeSeriesS.length < MAX_PLOT_POINTS_PER_NODE;

    const tempsAtAllTimes: PlotDataForTime[] = [];
    const heatTransfersAtAllTimes: PlotDataForTime[] = [];

    data.timeSeriesS.forEach((t, idx) => {
      if (includeAll || include(t)) {
        const temp: PlotDataForTime = { time: t };
        const ht: PlotDataForTime = { time: t };
        data.nodeResults.forEach((nodeResult) => {
          temp[nodeResult.node.name] = nodeResult.tempDegC[idx];
        });
        data.connectionResults.forEach((connectionResult) => {
          ht[
            `${connectionResult.connection.source.name} to ${connectionResult.connection.target.name}`
          ] = connectionResult.heatTransferW[idx];
        });
        tempsAtAllTimes.push(temp);
        heatTransfersAtAllTimes.push(ht);
      }
    });
    return [tempsAtAllTimes, heatTransfersAtAllTimes];
  }

  const res =
    !!props.modelOutput && props.modelOutput.nodeResults.length > 0
      ? props.modelOutput
      : emptyOutput;

  const [tempPlotData, heatTransferPlotData] = plotShape(res);

  return (
    <StyledPlot height={props.height}>
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
              dataKey="time"
              label={{
                value: "Time [seconds]",
                position: "center",
                dy: 20,
              }}
            />
            <YAxis
              label={{
                value: "Temperature [degC]",
                position: "center",
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
              dataKey="time"
              label={{
                value: "Time [seconds]",
                position: "center",
                dy: 20,
              }}
            />
            <YAxis
              label={{
                value: "Heat Transfer [Watts]",
                position: "center",
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
              // fontSize={5}
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
    </StyledPlot>
  );
}
