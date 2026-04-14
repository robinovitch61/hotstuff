import * as React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { forceShowScrollbars } from "./utils/scrollBar";

forceShowScrollbars();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
