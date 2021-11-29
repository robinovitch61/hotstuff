import { HSConnection, ModelOutput } from "hotstuff-network";
import config from "../../config";

function firstNodeStartsHotter(connection: HSConnection): boolean {
  return (
    connection.firstNode.temperatureDegC >=
    connection.secondNode.temperatureDegC
  );
}

export function getDataKeyForConnection(connection: HSConnection): string {
  const firstStartsHotter = firstNodeStartsHotter(connection);
  const firstName = firstStartsHotter
    ? connection.firstNode.name
    : connection.secondNode.name;
  const secondName = firstStartsHotter
    ? connection.secondNode.name
    : connection.firstNode.name;
  return `${firstName} to ${secondName}`;
}

export function roundToNearestTenth(input: number): number {
  return Math.round(input * 10) / 10;
}

type TimeSeriesPlotData = {
  time: number;
  [key: string]: number;
};

export function getDataForPlots(
  data: ModelOutput
): [TimeSeriesPlotData[], TimeSeriesPlotData[]] {
  // the number of points depends on the order of magnitude
  const lowerMag = Math.floor(Math.log10(data.totalTimeS));
  const divisibleBy = Math.pow(10, lowerMag - 1);
  function include(val: number) {
    return Math.abs(val % divisibleBy) === 0;
  }

  const includeAll = data.timeSeriesS.length < config.maxPlotPoints;

  const tempsAtAllTimes: TimeSeriesPlotData[] = [];
  const heatTransfersAtAllTimes: TimeSeriesPlotData[] = [];

  data.timeSeriesS.forEach((t, idx) => {
    if (includeAll || include(t)) {
      const temp: TimeSeriesPlotData = { time: t };
      const ht: TimeSeriesPlotData = { time: t };

      data.nodeResults.forEach((nodeResult) => {
        const tempVal = nodeResult.tempDegC[idx];
        temp[nodeResult.node.name] = roundToNearestTenth(tempVal);
      });

      data.connectionResults.forEach((connectionResult) => {
        const heatTransferVal = connectionResult.heatTransferW[idx];
        const signedHeatTransferVal = firstNodeStartsHotter(
          connectionResult.connection
        )
          ? heatTransferVal
          : -heatTransferVal;
        ht[getDataKeyForConnection(connectionResult.connection)] =
          roundToNearestTenth(signedHeatTransferVal);
      });

      tempsAtAllTimes.push(temp);
      heatTransfersAtAllTimes.push(ht);
    }
  });
  return [tempsAtAllTimes, heatTransfersAtAllTimes];
}
