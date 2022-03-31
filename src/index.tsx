import * as React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { forceShowScrollbars } from "./utils/scrollBar";
import Plausible from "plausible-tracker";

const plausible = Plausible({
  domain: "thermalmodel.com",
  apiHost: "https://plausible.theleo.zone",
});

plausible.trackPageview();

forceShowScrollbars();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
