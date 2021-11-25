import * as React from "react";
import { useMemo } from "react";
import { Line } from "recharts";
import styled from "styled-components";
import { emptyOutput, ModelOutput } from "hotstuff-network";
import LinePlot from "./LinePlot";
import Tabs from "../Tabs/Tabs";
import config from "../../config";

const { maxPlotPoints, plotDomainMarginPercent } = config;

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

  .chart {
    width: 60% !important;
    max-width: 900px;

    @media only screen and (max-width: 600px) {
      width: 90% !important;
      touch-action: pan-y;
    }
  }
`;

const StyledPlot = styled.div<{ height: number; width: number }>`
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

export type PlotDimensions = {
  height: number;
  width: number;
  margin: Margin;
};

type TimeSeriesPlotData = {
  time: number;
  [key: string]: number;
};

type PlotDomain = [number, number];

function roundToNearestTenth(input: number): number {
  return Math.round(input * 10) / 10;
}

function plotShape(
  data: ModelOutput
): [TimeSeriesPlotData[], PlotDomain, TimeSeriesPlotData[], PlotDomain] {
  // the number of points depends on the order of magnitude
  const lowerMag = Math.floor(Math.log10(data.totalTimeS));
  const divisibleBy = Math.pow(10, lowerMag - 1);
  function include(val: number) {
    return Math.abs(val % divisibleBy) === 0;
  }

  const includeAll = data.timeSeriesS.length < maxPlotPoints;

  const tempsAtAllTimes: TimeSeriesPlotData[] = [];
  let minTemp = 1e9;
  let maxTemp = -1e9;
  const heatTransfersAtAllTimes: TimeSeriesPlotData[] = [];
  let minHeatTransfer = 1e9;
  let maxHeatTransfer = -1e9;

  data.timeSeriesS.forEach((t, idx) => {
    if (includeAll || include(t)) {
      const temp: TimeSeriesPlotData = { time: t };
      const ht: TimeSeriesPlotData = { time: t };

      data.nodeResults.forEach((nodeResult) => {
        const tempVal = nodeResult.tempDegC[idx];
        if (tempVal < minTemp) {
          minTemp = tempVal;
        } else if (tempVal > maxTemp) {
          maxTemp = tempVal;
        }
        temp[nodeResult.node.name] = roundToNearestTenth(tempVal);
      });

      data.connectionResults.forEach((connectionResult) => {
        const heatTransferVal = connectionResult.heatTransferW[idx];
        if (heatTransferVal < minHeatTransfer) {
          minHeatTransfer = heatTransferVal;
        } else if (heatTransferVal > maxHeatTransfer) {
          maxHeatTransfer = heatTransferVal;
        }
        ht[
          `${connectionResult.connection.firstNode.name} to ${connectionResult.connection.secondNode.name}`
        ] = roundToNearestTenth(heatTransferVal);
      });

      tempsAtAllTimes.push(temp);
      heatTransfersAtAllTimes.push(ht);
    }
  });
  return [
    tempsAtAllTimes,
    [minTemp, maxTemp],
    heatTransfersAtAllTimes,
    [minHeatTransfer, maxHeatTransfer],
  ];
}

type PlotProps = {
  plotDimensions: PlotDimensions;
  modelOutput?: ModelOutput;
};

export default function Plot(props: PlotProps): React.ReactElement {
  const modelHasOutput = !!(
    props.modelOutput && props.modelOutput.nodeResults.length > 0
  );
  const res =
    modelHasOutput && props.modelOutput ? props.modelOutput : emptyOutput;

  const [tempPlotData, tempDomain, heatTransferPlotData, heatTransferDomain] =
    plotShape(res);

  const yTempDomainMargin =
    (tempDomain[1] - tempDomain[0]) * plotDomainMarginPercent;
  const yTempDomain: [number, number] | undefined = modelHasOutput
    ? [
        Math.floor(tempDomain[0] - yTempDomainMargin),
        Math.ceil(tempDomain[1] + yTempDomainMargin),
      ]
    : undefined;

  const yHeatTransferDomainMargin =
    (heatTransferDomain[1] - heatTransferDomain[0]) * plotDomainMarginPercent;
  const yHeatTransferDomain: [number, number] | undefined = modelHasOutput
    ? [
        Math.floor(heatTransferDomain[0] - yHeatTransferDomainMargin),
        Math.ceil(heatTransferDomain[1] + yHeatTransferDomainMargin),
      ]
    : undefined;

  const heatTransferLines = useMemo(
    () =>
      res.connectionResults.map((connectionResult, idx) => {
        return (
          <Line
            key={connectionResult.connection.id}
            type={"monotone"}
            dataKey={`${connectionResult.connection.firstNode.name} to ${connectionResult.connection.secondNode.name}`}
            stroke={colors[idx]}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
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
            isAnimationActive={false}
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
      yDomain={yTempDomain}
      unit={"degC"}
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
      yDomain={yHeatTransferDomain}
      unit={"W"}
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
