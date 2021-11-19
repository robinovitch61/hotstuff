import { makeNode } from "hotstuff-network";
import { AppConnection, AppNode, ModalState, PanelSizes, Timing } from "./App";
import config from "./config";
import { ORIGIN } from "./utils/pointUtils";
import { CanvasViewState } from "./components/Canvas/Canvas";
import { makeNewConnection } from "./utils/nodeConnectionUtils";

const jerryNode = makeNode({
  name: "Jerry the Cat",
  temperatureDegC: 38.3,
  capacitanceJPerDegK: 16.2e3, // 3.6kJ/kg/degK * 4.5kg
  powerGenW: 100, // ??
  isBoundary: false,
});
const jerryAppNode: AppNode = {
  ...jerryNode,
  center: { x: 200, y: 150 },
  isActive: false,
  textDirection: "L",
};

const bedNode = makeNode({
  name: "Heated Cat Bed",
  temperatureDegC: 40, // ??
  capacitanceJPerDegK: 10e3,
  powerGenW: 4,
  isBoundary: false,
});
const bedAppNode: AppNode = {
  ...bedNode,
  center: { x: 500, y: 150 },
  isActive: false,
  textDirection: "R",
};

const airNode = makeNode({
  name: "Apartment Air",
  temperatureDegC: 22.5,
  capacitanceJPerDegK: 6e5, // 1.0035J/g/degK * 600,000g
  powerGenW: 0,
  isBoundary: false,
});
const airAppNode: AppNode = {
  ...airNode,
  center: { x: 350, y: 300 },
  isActive: false,
  textDirection: "D",
};

export const defaultNodes: AppNode[] = [jerryAppNode, bedAppNode, airAppNode];

export const defaultConnections: AppConnection[] = [
  makeNewConnection(jerryNode, bedNode, "cond", 2.5), // 0.01m / 0.1m^2 / 0.04W/m/degK
  makeNewConnection(airNode, jerryNode, "conv", 0.33), // 1 / 0.3m^2 / 10W/m^2/degK
  makeNewConnection(airNode, bedNode, "conv", 0.67), // 1 / 0.3m^2 / 5W/m^2/degK
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
  editorWidthFraction: config.defaultEditorWidthFraction,
  canvasHeightFraction: config.defaultCanvasHeightFraction,
  tableHeightFraction: config.defaultTableHeightFraction,
};

export const defaultModalState: ModalState = {
  visible: false,
  type: "theory",
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
