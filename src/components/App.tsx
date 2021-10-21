import {
  HSConnection,
  HSNode,
  makeConnection,
  makeNode,
} from "hotstuff-network";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import styled from "styled-components";
import { makePoint, ORIGIN, Point } from "./Canvas/pointUtils";
import Sidebar from "./Sidebar/Sidebar";
import Plot from "./Plot/Plot";
import config from "../config";
import useWindowSize from "./Canvas/hooks/useWindowSize";
import Canvas, { CanvasState, SavedCanvasState } from "./Canvas/Canvas";
import {
  drawArrow,
  drawConnection,
  drawNode,
  intersectsCircle,
  mouseToNodeCoords,
} from "./Canvas/canvasUtils";
import useClickAndDrag from "./Canvas/hooks/useClickAndDrag";

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
  const [savedCanvasState, setSavedCanvasState] = useState<SavedCanvasState>({
    offset: ORIGIN,
    scale: 1,
  });
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
    (event: React.MouseEvent | MouseEvent, canvasState: CanvasState) => {
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
        center: mouseToNodeCoords(event, canvasState),
        radius: defaultNodeRadius,
        color: "red",
        isActive: false,
      };
      addNode(newAppNode);
    },
    [addNode, appNodes]
  );

  // const [
  //   connectionMousePos,
  //   isConnectionDone,
  //   startMakeConnection,
  // ] = useClickAndDrag();
  //
  // // draw connection if it's being made
  // useLayoutEffect(() => {
  //   // at this point only the selected node should be active
  //   const activeNodes = appNodes.filter((node) => node.isActive);
  //   if (activeNodes.length !== 1) {
  //     return;
  //   }
  //   const activeNode = activeNodes[0];
  //
  //   if (context && !isConnectionDone) {
  //     drawArrow(
  //       context,
  //       activeNode.center,
  //       mouseToNodeCoords(connectionMousePos, offset, scale),
  //       "grey"
  //     );
  //   } else if (isConnectionDone) {
  //     nodes.map((node) => {
  //       if (
  //         intersectsCircle(
  //           mouseToNodeCoords(
  //             makePoint(connectionMousePos.x, connectionMousePos.y),
  //             offset,
  //             scale
  //           ),
  //           node.center,
  //           node.radius
  //         ) &&
  //         node.id !== activeNode.id &&
  //         !connections.some(
  //           (conn) =>
  //             (conn.source.id === node.id &&
  //               conn.target.id === activeNode.id) ||
  //             (conn.target.id === node.id && conn.source.id === activeNode.id)
  //         )
  //       ) {
  //         const newConnection = {
  //           ...makeConnection({
  //             source: activeNode,
  //             target: node,
  //             resistanceDegKPerW: defaultResistanceDegKPerW,
  //             kind: defaultConnectionKind,
  //           }),
  //           sourceName: activeNode.name,
  //           targetName: node.name,
  //         };
  //         setAppConnections([...connections, newConnection]);
  //       }
  //     });
  //   }
  // }, [connectionMousePos, isConnectionDone]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  function drawConnectionBeingMade(
    event: React.MouseEvent | MouseEvent,
    canvasState: CanvasState
  ) {
    // at this point only the selected node should be active
    const activeNodes = appNodes.filter((node) => node.isActive);
    if (activeNodes.length !== 1) {
      return;
    }
    const activeNode = activeNodes[0];

    if (canvasState.context) {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);
      drawArrow(
        canvasState.context,
        activeNode.center,
        nodeCoordsOfMouse,
        "grey"
      );
    }
    // else {
    //   appNodes.map((node) => {
    //     if (
    //       intersectsCircle(mousePosInNodeCoords, node.center, node.radius) &&
    //       node.id !== activeNode.id &&
    //       !appConnections.some(
    //         (conn) =>
    //           (conn.source.id === node.id &&
    //             conn.target.id === activeNode.id) ||
    //           (conn.target.id === node.id && conn.source.id === activeNode.id)
    //       )
    //     ) {
    //       const newConnection = {
    //         ...makeConnection({
    //           source: activeNode,
    //           target: node,
    //           resistanceDegKPerW: defaultResistanceDegKPerW,
    //           kind: defaultConnectionKind,
    //         }),
    //         sourceName: activeNode.name,
    //         targetName: node.name,
    //       };
    //       setAppConnections([...connections, newConnection]);
    //     }
    //   });
    // }
  }

  const onMouseDown = useCallback(
    (event, canvasState, defaultBehavior) => {
      const nodeCoordsOfMouse = mouseToNodeCoords(event, canvasState);

      const activeNodeIds = appNodes
        .filter((node) => node.isActive)
        .map((node) => node.id);

      const clickedNode = appNodes.find((node) =>
        intersectsCircle(nodeCoordsOfMouse, node.center, node.radius)
      );

      if (clickedNode) {
        if (event.altKey) {
          clearActiveNodes();
          updateActiveNodes([clickedNode.id], false);

          const drawConnWrapper = (event: React.MouseEvent | MouseEvent) =>
            drawConnectionBeingMade(event, canvasState);

          const mouseUp = () => {
            document.removeEventListener("mousemove", drawConnWrapper);
            document.removeEventListener("mouseup", mouseUp);
          };
          document.addEventListener("mousemove", drawConnWrapper);
          document.addEventListener("mouseup", mouseUp);
        } else if (event.shiftKey && activeNodeIds.includes(clickedNode.id)) {
          updateActiveNodes(
            activeNodeIds.filter((id) => id !== clickedNode.id),
            false
          );
        } else {
          const sticky =
            event.shiftKey ||
            (activeNodeIds.length > 1 && clickedNode.isActive);
          updateActiveNodes([clickedNode.id], sticky);
          // startNodeMove(event);
        }
      } else {
        if (event.shiftKey) {
          // startMultiSelectRef.current = mouseToNodeCoords(
          //   mousePos,
          //   offset,
          //   scale
          // );
          // startMultiSelect(event);
        } else {
          clearActiveNodes();
          defaultBehavior(event);
        }
      }
    },
    [appNodes, clearActiveNodes, updateActiveNodes]
  );

  return (
    <StyledApp height={windowHeight}>
      <StyledWorkspace height={workspaceHeight} width={workspaceWidth}>
        <StyledCanvas height={canvasHeight}>
          <Canvas
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            devicePixelRatio={ratio}
            draw={draw}
            onMouseDown={onMouseDown}
            handleDoubleClick={handleDoubleClick}
            savedCanvasState={savedCanvasState}
            setSavedCanvasState={setSavedCanvasState}
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
