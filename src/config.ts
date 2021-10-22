import { HSConnection } from "hotstuff-network";

const config = {
  canvasHeightPerc: 0.75,
  editorWidthPerc: 0.3,
  defaultTotalTimeSeconds: 10,
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
};

export default config;
