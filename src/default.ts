import { makeConnection, makeNode } from "hotstuff-network";
import { AppConnection, AppNode, PanelSizes, Timing } from "./App";
import config from "./config";
import { ORIGIN } from "./utils/pointUtils";
import { CanvasViewState } from "./components/Canvas/Canvas";

const firstNode = makeNode({
  name: "1: Click to select",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const firstAppNode: AppNode = {
  ...firstNode,
  center: { x: 100, y: 100 },
  isActive: false,
  textDirection: "D",
};

const secondNode = makeNode({
  name: "2: Shift-click to toggle selection",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const secondAppNode: AppNode = {
  ...secondNode,
  center: { x: 300, y: 150 },
  isActive: true,
  textDirection: "D",
};

const thirdNode = makeNode({
  name: "3: Click+drag to move",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const thirdAppNode: AppNode = {
  ...thirdNode,
  center: { x: 500, y: 100 },
  isActive: false,
  textDirection: "D",
};

const fourthNode = makeNode({
  name: "4: Double click space to create node",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const fourthAppNode: AppNode = {
  ...fourthNode,
  center: { x: 700, y: 150 },
  isActive: false,
  textDirection: "U",
};

const fifthNode = makeNode({
  name: "5: Alt+click+drag+release to connect",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const fifthAppNode: AppNode = {
  ...fifthNode,
  center: { x: 200, y: 300 },
  isActive: false,
  textDirection: "D",
};

const sixthNode = makeNode({
  name: "6: Delete to remove selected",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const sixthAppNode: AppNode = {
  ...sixthNode,
  center: { x: 400, y: 350 },
  isActive: true,
  textDirection: "D",
};

const seventhNode = makeNode({
  name: "7: Double click node to move text",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const seventhAppNode: AppNode = {
  ...seventhNode,
  center: { x: 600, y: 300 },
  isActive: false,
  textDirection: "D",
};

const eighthNode = makeNode({
  name: "8: Change parameters in tables",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const eighthAppNode: AppNode = {
  ...eighthNode,
  center: { x: 800, y: 350 },
  isActive: false,
  textDirection: "U",
};

const ninthNode = makeNode({
  name: "9: Adjust time & run model below tables",
  temperatureDegC: 85,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});
const ninthAppNode: AppNode = {
  ...ninthNode,
  center: { x: 500, y: 500 },
  isActive: true,
  textDirection: "D",
};

export const defaultNodes: AppNode[] = [
  firstAppNode,
  secondAppNode,
  thirdAppNode,
  fourthAppNode,
  fifthAppNode,
  sixthAppNode,
  seventhAppNode,
  eighthAppNode,
  ninthAppNode,
];

export const defaultConnections: AppConnection[] = [
  {
    ...makeConnection({
      source: firstNode,
      target: secondNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: firstNode.name,
    targetName: secondNode.name,
  },
  {
    ...makeConnection({
      source: secondNode,
      target: thirdNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: secondNode.name,
    targetName: thirdNode.name,
  },
  {
    ...makeConnection({
      source: thirdNode,
      target: fourthNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: thirdNode.name,
    targetName: fourthNode.name,
  },
  {
    ...makeConnection({
      source: fourthNode,
      target: fifthNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: fourthNode.name,
    targetName: fifthNode.name,
  },
  {
    ...makeConnection({
      source: fifthNode,
      target: sixthNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: fifthNode.name,
    targetName: sixthNode.name,
  },
  {
    ...makeConnection({
      source: sixthNode,
      target: seventhNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: sixthNode.name,
    targetName: seventhNode.name,
  },
  {
    ...makeConnection({
      source: seventhNode,
      target: eighthNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: seventhNode.name,
    targetName: eighthNode.name,
  },
  {
    ...makeConnection({
      source: eighthNode,
      target: ninthNode,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
    sourceName: eighthNode.name,
    targetName: ninthNode.name,
  },
];

export const defaultTiming: Timing = {
  timeStepS: config.defaultTimeStepSeconds,
  totalTimeS: config.defaultTotalTimeSeconds,
};

export const defaultCanvasViewState: CanvasViewState = {
  offset: ORIGIN,
  scale: 1,
};

export const defaultPanelSizes: PanelSizes = {
  editorWidthFraction: 0.3,
  canvasHeightFraction: 0.7,
};

export const defaultAppState = {
  output: undefined,
  timing: defaultTiming,
  nodes: defaultNodes,
  connections: defaultConnections,
  canvasViewState: defaultCanvasViewState,
  savedCanvasState: defaultCanvasViewState,
  panelSizes: defaultPanelSizes,
};
