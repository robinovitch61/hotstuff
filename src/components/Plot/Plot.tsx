import * as React from "react";
import { useCallback, useMemo } from "react";
import { Line } from "recharts";
import styled from "styled-components";
import { emptyOutput, ModelOutput } from "hotstuff-network";
import LinePlot from "./LinePlot";
import Tabs from "../Tabs/Tabs";

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

const StyledPlot = styled.div<{ height: number; width: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
  height: ${(props) => props.width}px;
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

export type PlotDimensions = {
  height: number;
  width: number;
  margin: Margin;
};

type PlotDataForTime = {
  time: number;
  [key: string]: number;
};

function plotShape(data: ModelOutput): [PlotDataForTime[], PlotDataForTime[]] {
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

type PlotProps = {
  plotDimensions: PlotDimensions;
  modelOutput?: ModelOutput;
};

export default function Plot(props: PlotProps): React.ReactElement {
  const res =
    !!props.modelOutput && props.modelOutput.nodeResults.length > 0
      ? props.modelOutput
      : emptyOutput;

  const [tempPlotData, heatTransferPlotData] = plotShape(res);

  const heatTransferLines = useMemo(
    () =>
      res.connectionResults.map((connectionResult, idx) => {
        return (
          <Line
            key={connectionResult.connection.id}
            type={"monotone"}
            dataKey={`${connectionResult.connection.source.name} to ${connectionResult.connection.target.name}`}
            stroke={colors[idx]}
            activeDot={{ r: 8 }}
          />
        );
      }),
    [res.connectionResults]
  );

  const tempLines = useMemo(
    () =>
      res.nodeResults.map((nodeResult, idx) => {
        return (
          <Line
            key={nodeResult.node.id}
            type={"monotone"}
            dataKey={nodeResult.node.name}
            stroke={colors[idx]}
            activeDot={{ r: 8 }}
          />
        );
      }),
    [res.nodeResults]
  );

  const tempPlot = (
    <LinePlot
      plotDimensions={props.plotDimensions}
      plotData={tempPlotData}
      lines={tempLines}
      xAxisKey={"time"}
      xLabel={"Time [s]"}
      yLabel={"Temperature [degC]"}
    />
  );

  const heatTransferPlot = (
    <LinePlot
      plotDimensions={props.plotDimensions}
      plotData={heatTransferPlotData}
      lines={heatTransferLines}
      xAxisKey={"time"}
      xLabel={"Time [s]"}
      yLabel={"Heat Transfer [Watts]"}
    />
  );

  return (
    <StyledPlot
      height={props.plotDimensions.height}
      width={props.plotDimensions.width}
    >
      <StyledCharts>
        <Tabs
          tabs={[
            {
              text: "Temperature",
              component: tempPlot,
              width: 0.5,
            },
            {
              text: "Heat Transfer",
              component: heatTransferPlot,
              width: 0.5,
            },
          ]}
        />
      </StyledCharts>
    </StyledPlot>
  );
}
