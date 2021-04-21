import { HSConnection, HSNode, ModelOutput } from "hotstuff-network";
import React, { useState } from "react";
import styled from "styled-components";
import Canvas from "./Canvas/Canvas";
import Editor from "./Editor/Editor";
import Plot from "./Plot/Plot";

const MAX_PLOT_POINTS_PER_NODE = 400;
const DEFAULT_TIMESTEP = 0.1;
const DEFAULT_TOTAL_TIME = 50;

export type Point = {
  xPos: number;
  yPos: number;
};

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
};

export type AppConnection = HSConnection & {
  center: Point;
  radius: number;
  color: string;
};

const StyledWorkspace = styled.div``;

export default function App() {
  const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
    undefined
  );
  const [totalTimeS, setTotalTimeS] = useState(DEFAULT_TOTAL_TIME);
  const [timeStepS, setTimeStepS] = useState(DEFAULT_TIMESTEP);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);

  return (
    <div>
      <StyledWorkspace>
        <Canvas
          nodes={[]}
          addNode={(node: AppNode) => setAppNodes([...appNodes, node])}
        />
        <Plot />
      </StyledWorkspace>
      <Editor />
    </div>
  );
}
