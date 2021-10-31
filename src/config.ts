import { HSConnection } from "hotstuff-network";

const config = {
  defaultTempDegC: 23,
  defaultCapJPerDegK: 1,
  defaultPowerGenW: 0,
  canvasHeightPerc: 0.75,
  editorWidthPerc: 0.3,
  defaultTotalTimeSeconds: 60,
  defaultTimeStepSeconds: 0.1,
  defaultNodeRadius: 20,
  defaultResistanceDegKPerW: 10,
  defaultConnectionKind: "bi" as HSConnection["kind"],
  newNodeNamePrefix: "New Node",
  zoomSensitivity: 1000, // bigger = less zoom per click
  minZoom: 0.25,
  maxZoom: 5,
  activeNodeOutlineWidth: 5,
  tabHeightPx: 25,
  tableDeleteCellWidthPerc: 0.1,
  tableDeleteCellMinWidthPx: 40,
  plotMargin: {
    left: 5,
    right: 5,
    top: 40,
    bottom: 40,
  },
};

export default config;
