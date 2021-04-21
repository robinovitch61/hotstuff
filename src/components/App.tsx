import { HSConnection, HSNode, ModelOutput } from "hotstuff-network";
import React, { useState } from "react";
import styled from "styled-components";
import Canvas from "./Canvas/Canvas";
import Editor from "./Editor/Editor";
import Plot from "./Plot/Plot";
import config from "../config";

const {
  defaultTimeStepSeconds,
  defaultTotalTimeSeconds,
  editorWidthPerc,
} = config;

export type Point = {
  xPos: number;
  yPos: number;
};

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
};

export type AppConnection = HSConnection;

const StyledWorkspace = styled.div`
  width: ${(1 - editorWidthPerc) * 100}vw;
`;

export default function App() {
  const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
    undefined
  );
  const [timeStepS, setTimeStepS] = useState(defaultTimeStepSeconds);
  const [totalTimeS, setTotalTimeS] = useState(defaultTotalTimeSeconds);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);

  return (
    <>
      <StyledWorkspace>
        <Canvas
          nodes={appNodes}
          addNode={(node: AppNode) => setAppNodes([...appNodes, node])}
        />
        <Plot />
      </StyledWorkspace>
      <Editor />
    </>
  );
}
