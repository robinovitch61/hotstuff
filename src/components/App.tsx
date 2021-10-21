import {
  HSConnection,
  HSNode,
  makeConnection,
  makeNode,
} from "hotstuff-network";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { makePoint, ORIGIN, Point } from "./Canvas/pointUtils";
import Sidebar from "./Sidebar/Sidebar";
import Plot from "./Plot/Plot";
import config from "../config";
import useWindowSize from "./Canvas/hooks/useWindowSize";
import Canvas from "./Canvas/Canvas";
import {
  drawConnection,
  drawNode,
  mouseToNodeCoords,
} from "./Canvas/canvasUtils";

const {
  sidebarWidthPerc: editorWidthPerc,
  canvasHeightPerc,
  defaultNodeRadius,
  newNodeNamePrefix,
} = config;

export type AppNode = HSNode & {
  center: Point;
  radius: number;
  color: string;
  isActive: boolean;
};

export type AppConnection = HSConnection & {
  sourceName: string;
  targetName: string;
};

const StyledApp = styled.div<{ height: number }>`
  display: flex;
  height: ${(props) => props.height}px;
`;

const StyledWorkspace = styled.div<{ height: number; width: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => (1 - editorWidthPerc) * props.width}px;
`;

const StyledCanvas = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
`;

const test1 = makeNode({
  name: "test1",
  temperatureDegC: 20,
  capacitanceJPerDegK: 10,
  powerGenW: 0,
  isBoundary: true,
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
    center: { x: 200, y: 200 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...test2,
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
  },
  {
    ...makeNode({
      name: "test2",
      temperatureDegC: 50,
      capacitanceJPerDegK: 200,
      powerGenW: 0,
      isBoundary: false,
    }),
    center: { x: 650, y: 450 },
    radius: defaultNodeRadius,
    color: "red",
    isActive: false,
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
    sourceName: test1.name,
    targetName: test2.name,
  },
];

export default function App(): React.ReactElement {
  // const [modelOutput, setModelOutput] = useState<ModelOutput | undefined>(
  //   undefined
  // );
  // const [timeStepS, setTimeStepS] = useState(defaultTimeStepSeconds);
  // const [totalTimeS, setTotalTimeS] = useState(defaultTotalTimeSeconds);
  const [appNodes, setAppNodes] = useState<AppNode[]>([]);
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);
  // const [activeNode, setActiveNode] = useState<AppNode | undefined>(undefined);
  const [savedOffset, setSavedOffset] = useState<Point>(ORIGIN);
  const [savedScale, setSavedScale] = useState<number>(1);
  const [size, ratio] = useWindowSize();

  const [windowWidth, windowHeight] = size;

  // width/heights
  const workspaceWidth = windowWidth;
  const workspaceHeight = windowHeight;
  const canvasHeight = windowHeight * canvasHeightPerc;
  const canvasWidth = windowWidth * (1 - editorWidthPerc);
  const plotHeight = (1 - canvasHeightPerc) * windowHeight;
  const editorWidth = editorWidthPerc * windowWidth;

  // TODO: REMOVE
  useEffect(() => {
    setAppNodes(testAppNodes);
    setAppConnections(testAppConnections);
  }, []);

  // node modifiers
  const addNode = useCallback(
    (node: AppNode) => {
      const newNodes: AppNode[] = appNodes.map((node) => ({
        ...node,
        isActive: false,
      }));
      newNodes.push({ ...node, isActive: true });
      setAppNodes(newNodes);
    },
    [appNodes]
  );

  const deleteConnectionsForNode = useCallback(
    (nodeId: string) => {
      setAppConnections(
        appConnections.filter(
          (conn) => conn.source.id !== nodeId && conn.target.id !== nodeId
        )
      );
    },
    [appConnections]
  );

  const updateNodes = useCallback(
    (nodesToUpdate: AppNode[]) => {
      const nodeIdsToUpdate = nodesToUpdate.map((node) => node.id);
      const newNodes = appNodes.map((node) => {
        if (nodeIdsToUpdate.includes(node.id)) {
          return nodesToUpdate.filter((newNode) => newNode.id === node.id)[0];
        } else {
          return node;
        }
      });
      setAppNodes(newNodes);
    },
    [appNodes]
  );

  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      nodeIds.forEach((id) => deleteConnectionsForNode(id));
      setAppNodes(appNodes.filter((node) => !nodeIds.includes(node.id)));
    },
    [appNodes, deleteConnectionsForNode]
  );

  const updateConnections = useCallback(
    (connsToUpdate: AppConnection[]) => {
      const connIdsToUpdate = connsToUpdate.map((conn) => conn.id);
      const newConns = appConnections.map((conn) => {
        if (connIdsToUpdate.includes(conn.id)) {
          return connsToUpdate.filter((newConn) => newConn.id === conn.id)[0];
        } else {
          return conn;
        }
      });
      setAppConnections(newConns);
    },
    [appConnections]
  );

  const deleteConnections = useCallback(
    (connIds: string[]) => {
      setAppConnections(
        appConnections.filter((conn) => !connIds.includes(conn.id))
      );
    },
    [appConnections]
  );

  const updateActiveNodes = useCallback(
    (activeNodeIds: string[], sticky: boolean) => {
      setAppNodes(
        appNodes.map((node) => ({
          ...node,
          isActive: activeNodeIds.includes(node.id)
            ? true
            : sticky
            ? node.isActive
            : false,
        }))
      );
    },
    [appNodes]
  );

  const clearActiveNodes = useCallback(() => {
    setAppNodes(
      appNodes.map((node) => ({
        ...node,
        isActive: false,
      }))
    );
  }, [appNodes]);

  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      appNodes.map((node) => {
        drawNode(
          context,
          node.center,
          node.radius,
          node.isActive,
          node.isBoundary
          // node.temperatureDegC,
          // node.capacitanceJPerDegK
        );
      });

      appConnections.map((conn) => {
        const { source, target } = conn;
        const sourceAppNode = appNodes.filter(
          (node) => node.id === source.id
        )[0];
        const targetAppNode = appNodes.filter(
          (node) => node.id === target.id
        )[0];
        drawConnection(context, sourceAppNode, targetAppNode);
      });
    },
    [appConnections, appNodes]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent | MouseEvent, offset: Point, scale: number) => {
      if (event.shiftKey || event.altKey) {
        return;
      }
      const numNewNodes = appNodes.filter((node) =>
        node.name.startsWith(newNodeNamePrefix)
      ).length;
      const newNode = makeNode({
        name:
          numNewNodes === 0
            ? `${newNodeNamePrefix}`
            : `${newNodeNamePrefix} (${numNewNodes + 1})`,
        temperatureDegC: 0,
        capacitanceJPerDegK: 0,
        powerGenW: 0,
        isBoundary: false,
      });
      const newAppNode = {
        ...newNode,
        center: mouseToNodeCoords(
          makePoint(event.clientX, event.clientY),
          offset,
          scale
        ),
        radius: defaultNodeRadius,
        color: "red",
        isActive: false,
      };
      addNode(newAppNode);
    },
    [addNode]
  );

  const onMouseDown = useCallback((event, defaultBehavior) => {
    defaultBehavior(event);
  }, []);

  return (
    <StyledApp height={windowHeight}>
      <StyledWorkspace height={workspaceHeight} width={workspaceWidth}>
        <StyledCanvas height={canvasHeight}>
          <Canvas
            nodes={appNodes}
            connections={appConnections}
            addNode={addNode}
            updateNodes={updateNodes}
            updateActiveNodes={updateActiveNodes}
            clearActiveNodes={clearActiveNodes}
            setAppConnections={setAppConnections}
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            devicePixelRatio={ratio}
            savedOffset={savedOffset}
            setSavedOffset={setSavedOffset}
            savedScale={savedScale}
            setSavedScale={setSavedScale}
            draw={draw}
            handleDoubleClick={handleDoubleClick}
            onMouseDown={onMouseDown}
          />
        </StyledCanvas>
        <Plot height={plotHeight} />
      </StyledWorkspace>
      <Sidebar
        height={windowHeight}
        width={editorWidth}
        nodes={appNodes}
        connections={appConnections}
        addNode={addNode}
        updateNodes={updateNodes}
        deleteNodes={deleteNodes}
        updateConnections={updateConnections}
        deleteConnections={deleteConnections}
        updateActiveNodes={updateActiveNodes}
        clearActiveNodes={clearActiveNodes}
      />
    </StyledApp>
  );
}
