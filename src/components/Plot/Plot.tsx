import * as React from "react";
import { useMemo } from "react";
import { Line } from "recharts";
import styled from "styled-components";
import { emptyOutput, ModelOutput } from "hotstuff-network";
import LinePlot from "./LinePlot";
import Tabs from "../Tabs/Tabs";
import { getDataForPlots, getDataKeyForConnection } from "./plotUtils";

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

  const [tempPlotData, heatTransferPlotData] = getDataForPlots(res);

  const heatTransferLines = useMemo(
    () =>
      res.connectionResults.map((connectionResult, idx) => {
        return (
          <Line
            key={connectionResult.connection.id}
            type={"monotone"}
            dataKey={getDataKeyForConnection(connectionResult.connection)}
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
      yLabel={"Heat Transfer [W]"}
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
