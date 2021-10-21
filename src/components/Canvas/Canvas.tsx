import * as React from "react";
import { useLayoutEffect, useRef } from "react";
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
import { diffPoints, makePoint, Point, scalePoint } from "./pointUtils";
import { makeConnection, makeNode } from "hotstuff-network";
import useNodeMove from "./hooks/useNodeMove";
import useClickAndDrag from "./hooks/useClickAndDrag";
import Controls from "./Controls";

const StyledCanvasWrapper = styled.div`
  display: block;
  max-height: 100%;
  position: relative;
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

export type CanvasState = {
  context: CanvasRenderingContext2D | null;
  offset: Point;
  scale: number;
};

export type SavedCanvasState = Omit<CanvasState, "context">;

export type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
  devicePixelRatio: number;
  draw: (context: CanvasRenderingContext2D) => void;
  onMouseDown: (
    event: React.MouseEvent | MouseEvent,
    canvasState: CanvasState,
    defaultBehavior: (event: React.MouseEvent | MouseEvent) => void
  ) => void;
  handleDoubleClick: (
    event: React.MouseEvent,
    canvasState: CanvasState
  ) => void;
  savedCanvasState: SavedCanvasState;
  setSavedCanvasState: React.Dispatch<React.SetStateAction<SavedCanvasState>>;
};

export default function Canvas(props: CanvasProps): React.ReactElement {
  // destructure props
  const {
    canvasWidth,
    canvasHeight,
    devicePixelRatio,
    draw,
    onMouseDown,
    handleDoubleClick,
    savedCanvasState,
    setSavedCanvasState,
  } = props;

  // hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setView, offset, scale, startPan] =
    usePanZoomCanvas(canvasRef);
  // const [nodeDelta, startNodeMove] = useNodeMove();
  // const [
  //   connectionMousePos,
  //   isConnectionDone,
  //   startMakeConnection,
  // ] = useClickAndDrag();
  // const [
  //   multiSelectMousePos,
  //   isMultiSelectDone,
  //   startMultiSelect,
  // ] = useClickAndDrag();
  // const startMultiSelectRef = useRef<Point | undefined>(undefined);

  // function handleOnMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
  //   const canvas = canvasRef.current;
  //   if (canvas === null) {
  //     return;
  //   }
  //
  //   let nodeClicked = false;
  //   const activeNodeIds = nodes
  //     .filter((node) => node.isActive)
  //     .map((node) => node.id);
  //   nodes.some((node) => {
  //     if (
  //       intersectsCircle(
  //         mouseToNodeCoords(
  //           makePoint(event.clientX, event.clientY),
  //           offset,
  //           scale
  //         ),
  //         node.center,
  //         node.radius
  //       )
  //     ) {
  //       nodeClicked = true;
  //
  //       if (event.altKey) {
  //         clearActiveNodes();
  //         updateActiveNodes([node.id], false);
  //         startMakeConnection(event);
  //       } else if (event.shiftKey && activeNodeIds.includes(node.id)) {
  //         updateActiveNodes(
  //           activeNodeIds.filter((id) => id !== node.id),
  //           false
  //         );
  //       } else {
  //         const sticky =
  //           event.shiftKey || (activeNodeIds.length > 1 && node.isActive);
  //         updateActiveNodes([node.id], sticky);
  //         startNodeMove(event);
  //       }
  //       return true; // short circuits the rest of the some loop
  //     }
  //   });
  //
  //   if (!nodeClicked) {
  //     if (event.shiftKey) {
  //       startMultiSelectRef.current = mouseToNodeCoords(
  //         makePoint(event.clientX, event.clientY),
  //         offset,
  //         scale
  //       );
  //       startMultiSelect(event);
  //     } else {
  //       clearActiveNodes();
  //       startPan(event);
  //     }
  //   }
  // }

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      setView(renderCtx, makePoint(0, 0), 1);
    }
  }, [setView]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas
      context.canvas.width = context.canvas.width;

      context.scale(scale * devicePixelRatio, scale * devicePixelRatio);
      context.translate(offset.x, offset.y);

      draw(context);
    }
  }, [context, devicePixelRatio, draw, offset.x, offset.y, scale]);

  // // move active nodes if click and drag
  // useLayoutEffect(() => {
  //   const activeNodes = nodes.filter((node) => node.isActive);
  //   if (activeNodes.length === 0) {
  //     return;
  //   }
  //   const newActiveNodes = activeNodes.map((activeNode) => ({
  //     ...activeNode,
  //     isActive: true,
  //     center: diffPoints(activeNode.center, scalePoint(nodeDelta, scale)),
  //   }));
  //
  //   updateNodes(newActiveNodes);
  // }, [nodeDelta]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  // // draw connection if it's being made
  // useLayoutEffect(() => {
  //   // at this point only the selected node should be active
  //   const activeNodes = nodes.filter((node) => node.isActive);
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
  // }, [connectionMousePos, context, isConnectionDone]); // incomplete deps array here but infinite loop otherwise...I think it's fine
  //
  // // draw box during multi select
  // useLayoutEffect(() => {
  //   if (context && startMultiSelectRef.current && !isMultiSelectDone) {
  //     drawClearBox(
  //       context,
  //       startMultiSelectRef.current,
  //       mouseToNodeCoords(multiSelectMousePos, offset, scale),
  //       "grey"
  //     );
  //   } else if (isMultiSelectDone && startMultiSelectRef.current) {
  //     const startBoxPoint = startMultiSelectRef.current;
  //     const endBoxPoint = mouseToNodeCoords(multiSelectMousePos, offset, scale);
  //
  //     const extraActiveNodeIds = nodes
  //       .filter((node) => isInsideBox(startBoxPoint, endBoxPoint, node.center))
  //       .map((node) => node.id);
  //     updateActiveNodes(extraActiveNodeIds, true);
  //   }
  // }, [context, multiSelectMousePos, isMultiSelectDone]); // incomplete deps array here but infinite loop otherwise...I think it's fine

  return (
    <StyledCanvasWrapper>
      <Controls
        setView={setView}
        canvasState={{ context, offset, scale }}
        savedCanvasState={savedCanvasState}
        setSavedCanvasState={setSavedCanvasState}
      />
      <StyledCanvas
        ref={canvasRef}
        width={canvasWidth * devicePixelRatio}
        height={canvasHeight * devicePixelRatio}
        cssWidth={canvasWidth}
        cssHeight={canvasHeight}
        onMouseDown={(event: React.MouseEvent | MouseEvent) =>
          onMouseDown(event, { context, offset, scale }, () => startPan(event))
        }
        onDoubleClick={(event: React.MouseEvent) =>
          handleDoubleClick(event, { context, offset, scale })
        }
      />
    </StyledCanvasWrapper>
  );
}
