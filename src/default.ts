import { makeConnection, makeNode } from "hotstuff-network";
import { AppConnection, AppNode } from "./App";
import config from "./config";
import { ORIGIN } from "./utils/pointUtils";

const test1 = makeNode({
  name: "test1",
  temperatureDegC: 85,
  capacitanceJPerDegK: 100,
  powerGenW: 0,
  isBoundary: true,
});

const test2 = makeNode({
  name: "test2",
  temperatureDegC: 23,
  capacitanceJPerDegK: 2,
  powerGenW: 0,
  isBoundary: false,
});

export const defaultNodes: AppNode[] = [
  {
    ...test1,
    center: { x: 200, y: 200 },
    radius: config.defaultNodeRadius,
    color: "red",
    isActive: false,
    textDirection: "D",
  },
  {
    ...test2,
    center: { x: 650, y: 450 },
    radius: config.defaultNodeRadius,
    color: "red",
    isActive: false,
    textDirection: "D",
  },
];

export const defaultConnections: AppConnection[] = [
  {
    ...makeConnection({
      source: test1,
      target: test2,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: test1.name,
    targetName: test2.name,
  },
];

export const defaultTiming = {
  timeStepS: config.defaultTimeStepSeconds,
  totalTimeS: config.defaultTotalTimeSeconds,
};

export const defaultCanvasViewState = {
  offset: ORIGIN,
  scale: 1,
};

export const defaultAppState = {
  output: undefined,
  timing: defaultTiming,
  nodes: defaultNodes,
  connections: defaultConnections,
  canvasViewState: defaultCanvasViewState,
  savedCanvasState: defaultCanvasViewState,
};
