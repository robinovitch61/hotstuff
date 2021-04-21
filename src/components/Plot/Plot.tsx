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
/**
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
*/

export default function Plot() {
  // // show the temps of the first node as dots vertically along the svg
  // const plotParams = {
  //   height: 350,
  //   margin: {
  //     left: 5,
  //     right: 5,
  //     top: 40,
  //     bottom: 40,
  //   },
  // };

  // function plotShape(data: ModelOutput): [any[], any[]] {
  //   const lowerMag = Math.floor(Math.log10(data.totalTimeS));
  //   const divisibleBy = Math.pow(10, lowerMag - 1);

  //   function include(val: number) {
  //     return Math.abs(val % divisibleBy) === 0;
  //   }

  //   const includeAll = data.timeSeriesS.length < MAX_PLOT_POINTS_PER_NODE;
  //   const temps: any[] = [];
  //   const heatTransfers: any[] = [];
  //   data.timeSeriesS.forEach((t, idx) => {
  //     if (includeAll || include(t)) {
  //       const temp: any = { name: t };
  //       const ht: any = { name: t };
  //       data.nodeResults.forEach((nodeResult) => {
  //         temp[nodeResult.node.name] = nodeResult.tempDegC[idx];
  //       });
  //       data.connectionResults.forEach((connectionResult) => {
  //         ht[
  //           `${connectionResult.connection.source.name} to ${connectionResult.connection.target.name}`
  //         ] = connectionResult.heatTransferW[idx];
  //       });
  //       temps.push(temp);
  //       heatTransfers.push(ht);
  //     }
  //   });
  //   return [temps, heatTransfers];
  // }

  // const res =
  //   !!results && results.nodeResults.length > 0 ? results : emptyOutput;
  // const [tempPlotData, heatTransferPlotData] = plotShape(res);
  return <div>PLOT</div>;
}
