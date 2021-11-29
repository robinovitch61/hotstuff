import {
  CartesianGrid,
  Legend,
  LineChart,
  ReferenceLine,
  Tooltip,
  TooltipPayload,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import * as React from "react";
import { PlotDimensions } from "./Plot";
import styled from "styled-components/macro";
import config from "../../config";
// import { generateYTicks } from "./plotUtils";

const StyledToolTip = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 0.2em;
  //border-radius: 10px;
  border: 1px solid black;
`;

const StyledToolTipTitle = styled.div`
  font-size: 1em;
  font-weight: bold;
`;

const StyledToolTipItem = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  display: flex;
  justify-content: space-between;
`;

const StyledToolTipValue = styled.div<{ after: string }>`
  margin-left: 1em;

  &::after {
    content: "${(props) => props.after}";
  }
`;

function CustomTooltip(props: TooltipProps & { after: string }) {
  const { active, payload, label, after } = props;

  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort(
      (a: TooltipPayload, b: TooltipPayload) => {
        if (a.value > b.value) {
          return -1;
        } else if (a.value === b.value) {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        } else {
          return 1;
        }
      }
    );

    return (
      <StyledToolTip>
        <StyledToolTipTitle>{`Time: ${label}s`}</StyledToolTipTitle>
        {sortedPayload.map((item) => {
          return (
            <StyledToolTipItem key={item.name} color={item.color || "black"}>
              <div>{item.name}</div>
              <StyledToolTipValue after={after}>
                {item.value}
              </StyledToolTipValue>
            </StyledToolTipItem>
          );
        })}
      </StyledToolTip>
    );
  }

  return null;
}

type LinePlotProps = {
  plotDimensions: PlotDimensions;
  plotData?: ReadonlyArray<Record<string, unknown>>;
  lines: React.ReactElement[];
  xAxisKey: string;
  xLabel: string;
  yLabel: string;
  unit: string;
};

export default function LinePlot(props: LinePlotProps): React.ReactElement {
  const { plotDimensions, plotData, lines, xAxisKey, xLabel, yLabel, unit } =
    props;

  return (
    <LineChart
      height={plotDimensions.height}
      width={plotDimensions.width}
      margin={plotDimensions.margin}
      data={plotData}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey={xAxisKey}
        tick={{ fontSize: `${config.plotTickFontSizePx}` }}
        label={{
          value: xLabel,
          position: "center",
          dy: 20,
        }}
      />
      <YAxis
        domain={["dataMin", "auto"]}
        allowDecimals={false}
        tick={{ fontSize: `${config.plotTickFontSizePx}` }}
        padding={{
          top: config.plotYDomainPaddingPx,
          bottom: config.plotYDomainPaddingPx,
        }}
        label={{
          value: yLabel,
          position: "center",
          angle: -90,
          dx: -20,
        }}
      />
      <ReferenceLine y={0} stroke="black" strokeWidth={2} />
      <Tooltip content={<CustomTooltip after={unit} />} />
      <Legend
        layout="horizontal"
        verticalAlign="top"
        align="center"
        wrapperStyle={{
          paddingLeft: "10px",
          paddingBottom: "10px",
        }}
      />
      {lines}
    </LineChart>
  );
}
