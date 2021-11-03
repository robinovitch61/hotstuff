import {
  CartesianGrid,
  Legend,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as React from "react";
import { PlotDimensions } from "./Plot";

type LinePlotProps = {
  plotDimensions: PlotDimensions;
  plotData?: ReadonlyArray<Record<string, unknown>>;
  lines: React.ReactElement[];
  xAxisKey: string;
  xLabel: string;
  yLabel: string;
};

export default function LinePlot(props: LinePlotProps): React.ReactElement {
  const { plotDimensions, plotData, lines, xAxisKey, xLabel, yLabel } = props;

  return (
    <ResponsiveContainer
      height={plotDimensions.height}
      width={plotDimensions.width}
      className="chart"
    >
      <LineChart
        height={plotDimensions.height}
        width={plotDimensions.width}
        margin={plotDimensions.margin}
        data={plotData}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          label={{
            value: xLabel,
            position: "center",
            dy: 20,
          }}
        />
        <YAxis
          label={{
            value: yLabel,
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
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
}
