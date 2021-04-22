import {
  HSConnection,
  HSNode,
  makeConnection,
  makeNode,
  ModelOutput,
} from "hotstuff-network";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Canvas from "./Canvas/Canvas";
import Editor from "./Editor/Editor";
import Plot from "./Plot/Plot";
import config from "../config";

const {
  defaultTimeStepSeconds,
  defaultTotalTimeSeconds,
  editorWidthPerc,
  defaultNodeRadius,
} = config;

export type Point = {
  x: number;
  y: number;
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

const test1 = makeNode({
  name: "test1",
  temperatureDegC: 20,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: false,
});

const test2 = makeNode({
  name: "test2",
  temperatureDegC: 50,
  capacitanceJPerDegK: 200,
  powerGenW: 0,
  isBoundary: false,
});

const testAppNodes: AppNode[] = [
  {
    ...test1,
    center: { x: 100, y: 100 },
    radius: defaultNodeRadius,
    color: "red",
  },
  {
    ...test2,
    center: { x: 200, y: 200 },
    radius: defaultNodeRadius,
    color: "red",
  },
];

const testAppConnections: AppConnection[] = [
  {
    ...makeConnection({
      source: test1,
      target: test2,
      resistanceDegKPerW: 10,
      kind: "bi",
    }),
  },
];

export default function App() {
  const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
    undefined
  );
  const [timeStepS, setTimeStepS] = useState(defaultTimeStepSeconds);
  const [totalTimeS, setTotalTimeS] = useState(defaultTotalTimeSeconds);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);

  // TODO: REMOVE
  useEffect(() => {
    setAppNodes(testAppNodes);
    setAppConnections(testAppConnections);
  }, []);

  return (
    <>
      <StyledWorkspace>
        <Canvas
          nodes={appNodes}
          connections={appConnections}
          addNode={(node: AppNode) => setAppNodes([...appNodes, node])}
        />
        <Plot />
      </StyledWorkspace>
      <Editor />
    </>
  );
}
