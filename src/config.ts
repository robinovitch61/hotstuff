type MouseEventKey = "shiftKey" | "altKey" | "metaKey" | "ctrlKey";

const config = {
  maxTimeSteps: 100000,
  defaultTempDegC: 23,
  defaultCapJPerDegK: 10,
  defaultPowerGenW: 0,
  defaultTotalTimeSeconds: 600,
  defaultTimeStepSeconds: 0.1,
  defaultNodeName: "Unnamed",
  defaultNodeRadius: 20,
  defaultResistanceDegKPerW: 10,
  defaultSmallResistanceDegKPerW: 0.01,
  defaultEditorWidthFraction: 1 - 1 / 1.61803398875,
  defaultCanvasHeightFraction: 1 / 1.61803398875,
  defaultTableHeightFraction: 0.5,
  minPanelFraction: 0.1,
  newNodeNamePrefix: "New Node",
  zoomSensitivity: 1500, // bigger = less zoom per click
  minZoom: 0.5,
  maxZoom: 2,
  maxZoomDelta: 2,
  minRadiusPx: 20,
  maxRadiusPx: 40,
  activeNodeOutlineWidthPx: 5,
  tabHeightPx: 25,
  plotHeightBufferPx: 10,
  tableDeleteCellWidthPercent: 0.1,
  tableDeleteCellMinWidthPx: 40,
  plotMargin: {
    left: 10,
    right: 20,
    top: 20,
    bottom: 20,
  },
  plotDomainMarginPercent: 0.1,
  maxPlotPoints: 400,
  multiSelectKeys: ["metaKey", "ctrlKey"] as MouseEventKey[],
  errorMessageDurationSeconds: 3,
};

export default config;
