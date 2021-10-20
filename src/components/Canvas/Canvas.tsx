import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import {
  drawArrow,
  drawClearBox,
  drawConnection,
  drawNode,
  intersectsCircle,
  isInsideBox,
  mouseToNodeCoords,
} from "./canvasUtils";
import config from "../../config";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import { diffPoints, makePoint, ORIGIN, Point, scalePoint } from "./pointUtils";
import { makeConnection, makeNode } from "hotstuff-network";
import useNodeMove from "./hooks/useNodeMove";
import useClickAndDrag from "./hooks/useClickAndDrag";

const StyledCanvasWrapper = styled.div`
  display: block;
  max-height: 100%;
  position: relative;
`;

const StyledControls = styled.div`
  z-index: 10;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0.5em;

  > button {
    margin-right: 5px;
  }
`;

const StyledCanvas = styled.canvas<{ cssWidth: number; cssHeight: number }>`
  width: ${({ cssWidth }) => `${cssWidth}px`};
  height: ${({ cssHeight }) => `${cssHeight}px`};
`;

const {
  newNodeNamePrefix,
  defaultNodeRadius,
  defaultConnectionKind,
  defaultResistanceDegKPerW,
} = config;

export type CanvasProps = {
  nodes: AppNode[];
  connections: AppConnection[];
  addNode: (node: AppNode) => void;
  updateNodes: (nodes: AppNode[]) => void;
  updateActiveNodes: (nodeIds: string[], sticky: boolean) => void;
  clearActiveNodes: () => void;
  setAppConnections: React.Dispatch<React.SetStateAction<AppConnection[]>>;
  canvasWidth: number;
  canvasHeight: number;
  devicePixelRatio: number;
};

export default function Canvas(props: CanvasProps): React.ReactElement {
  // destructure props
  const {
    nodes,
    connections,
    canvasHeight,
    canvasWidth,
    devicePixelRatio,
    addNode,
    updateNodes,
    updateActiveNodes,
    clearActiveNodes,
    setAppConnections,
  } = props;

  // state - some of this should possibly live in localstorage or something to persist across site visits
  const [savedOffset, setSavedOffset] = useState<Point>(ORIGIN);
  const [savedScale, setSavedScale] = useState<number>(1);

  // hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setView, offset, scale, startPan] = usePanZoomCanvas(
    canvasRef
  );
  const [nodeDelta, startNodeMove] = useNodeMove();
  const [
    connectionMousePos,
    isConnectionDone,
    startMakeConnection,
  ] = useClickAndDrag();
  const [
    multiSelectMousePos,
    isMultiSelectDone,
    startMultiSelect,
  ] = useClickAndDrag();
  const startMultiSelectRef = useRef<Point | undefined>(undefined);

  function handleDoubleClick(
    event: React.MouseEvent<HTMLCanvasElement>,
    nodes: AppNode[]
  ) {
    if (event.shiftKey || event.altKey) {
      return;
    }
    const numNewNodes = nodes.filter((node) =>
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
  }

  function handleOnMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    let nodeClicked = false;
    const activeNodeIds = nodes
      .filter((node) => node.isActive)
      .map((node) => node.id);
    nodes.some((node) => {
      if (
        intersectsCircle(
          mouseToNodeCoords(
            makePoint(event.clientX, event.clientY),
            offset,
            scale
          ),
          node.center,
          node.radius
        )
      ) {
        nodeClicked = true;

        if (event.altKey) {
          clearActiveNodes();
          updateActiveNodes([node.id], false);
          startMakeConnection(event);
        } else if (event.shiftKey && activeNodeIds.includes(node.id)) {
          updateActiveNodes(
            activeNodeIds.filter((id) => id !== node.id),
            false
          );
        } else {
          const sticky =
            event.shiftKey || (activeNodeIds.length > 1 && node.isActive);
          updateActiveNodes([node.id], sticky);
          startNodeMove(event);
        }
        return true; // short circuits the rest of the some loop
      }
    });

    if (!nodeClicked) {
      if (event.shiftKey) {
        startMultiSelectRef.current = mouseToNodeCoords(
          makePoint(event.clientX, event.clientY),
          offset,
          scale
        );
        startMultiSelect(event);
      } else {
        clearActiveNodes();
        startPan(event);
      }
    }
  }

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      setView(renderCtx, makePoint(0, 0), 1);
    }
  }, [canvasHeight, canvasWidth, canvasRef, context, setView]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas
      context.canvas.width = context.canvas.width;

      context.scale(scale * devicePixelRatio, scale * devicePixelRatio);
      context.translate(offset.x, offset.y);

      nodes.map((node) => {
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

      connections.map((conn) => {
        const { source, target } = conn;
        // TODO: Smarter way to do this?
        const sourceAppNode = nodes.filter((node) => node.id === source.id)[0];
        const targetAppNode = nodes.filter((node) => node.id === target.id)[0];
        drawConnection(context, sourceAppNode, targetAppNode);
      });
    }
  }, [
    canvasWidth,
    canvasHeight,
    context,
    scale,
    offset,
    nodes,
    connections,
    connectionMousePos,
    isConnectionDone,
    multiSelectMousePos,
    isMultiSelectDone,
    devicePixelRatio,
  ]);

  // move active nodes if click and drag
  useLayoutEffect(() => {
    const activeNodes = nodes.filter((node) => node.isActive);
    if (activeNodes.length === 0) {
      return;
    }
    const newActiveNodes = activeNodes.map((activeNode) => ({
      ...activeNode,
      isActive: true,
      center: diffPoints(activeNode.center, scalePoint(nodeDelta, scale)),
    }));

    updateNodes(newActiveNodes);
  }, [nodeDelta]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  // draw connection if it's being made
  useLayoutEffect(() => {
    // at this point only the selected node should be active
    const activeNodes = nodes.filter((node) => node.isActive);
    if (activeNodes.length !== 1) {
      return;
    }
    const activeNode = activeNodes[0];

    if (context && !isConnectionDone) {
      drawArrow(
        context,
        activeNode.center,
        mouseToNodeCoords(connectionMousePos, offset, scale),
        "grey"
      );
    } else if (isConnectionDone) {
      nodes.map((node) => {
        if (
          intersectsCircle(
            mouseToNodeCoords(
              makePoint(connectionMousePos.x, connectionMousePos.y),
              offset,
              scale
            ),
            node.center,
            node.radius
          ) &&
          node.id !== activeNode.id &&
          !connections.some(
            (conn) =>
              (conn.source.id === node.id &&
                conn.target.id === activeNode.id) ||
              (conn.target.id === node.id && conn.source.id === activeNode.id)
          )
        ) {
          const newConnection = {
            ...makeConnection({
              source: activeNode,
              target: node,
              resistanceDegKPerW: defaultResistanceDegKPerW,
              kind: defaultConnectionKind,
            }),
            sourceName: activeNode.name,
            targetName: node.name,
          };
          setAppConnections([...connections, newConnection]);
        }
      });
    }
  }, [connectionMousePos, context, isConnectionDone]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  // draw box during multi select
  useLayoutEffect(() => {
    if (context && startMultiSelectRef.current && !isMultiSelectDone) {
      drawClearBox(
        context,
        startMultiSelectRef.current,
        mouseToNodeCoords(multiSelectMousePos, offset, scale),
        "grey"
      );
    } else if (isMultiSelectDone && startMultiSelectRef.current) {
      const startBoxPoint = startMultiSelectRef.current;
      const endBoxPoint = mouseToNodeCoords(multiSelectMousePos, offset, scale);

      const extraActiveNodeIds = nodes
        .filter((node) => isInsideBox(startBoxPoint, endBoxPoint, node.center))
        .map((node) => node.id);
      updateActiveNodes(extraActiveNodeIds, true);
    }
  }, [context, multiSelectMousePos, isMultiSelectDone]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  return (
    <StyledCanvasWrapper>
      <StyledControls>
        {/* <pre>nodes: {JSON.stringify(nodes, null, 2)}</pre> */}
        {/*<pre>mousePos: {JSON.stringify(mousePos, null, 2)}</pre>*/}
        {/*<pre>lastMousePos: {JSON.stringify(lastMousePos, null, 2)}</pre>*/}
        {/*<pre>conns: {JSON.stringify(connections, null, 2)}</pre>*/}
        {/*<pre>scale: {scale}</pre>*/}
        {/*<pre>offset: {JSON.stringify(offset)}</pre>*/}
        <button
          onClick={() => context && setView(context, savedOffset, savedScale)}
        >
          Reset View
        </button>
        <button
          onClick={() => {
            setSavedOffset(offset);
            setSavedScale(scale);
          }}
        >
          Save View
        </button>
      </StyledControls>
      <StyledCanvas
        ref={canvasRef}
        width={canvasWidth * devicePixelRatio}
        height={canvasHeight * devicePixelRatio}
        cssWidth={canvasWidth}
        cssHeight={canvasHeight}
        onMouseDown={handleOnMouseDown}
        onDoubleClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
          if (canvas === null) {
            return;
          }
          handleDoubleClick(event, nodes);
        }}
      />
    </StyledCanvasWrapper>
  );
}
