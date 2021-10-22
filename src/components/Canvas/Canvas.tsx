import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import { makePoint, Point } from "./pointUtils";
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

export type CanvasState = {
  context: CanvasRenderingContext2D | null;
  offset: Point;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
};

export type SavedCanvasState = {
  offset: Point;
  scale: number;
};

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
      context.canvas.width = canvasWidth * devicePixelRatio;
      context.canvas.height = canvasHeight * devicePixelRatio;

      context.scale(scale * devicePixelRatio, scale * devicePixelRatio);
      context.translate(offset.x, offset.y);

      draw(context);
    }
  }, [
    canvasHeight,
    canvasWidth,
    context,
    devicePixelRatio,
    draw,
    offset.x,
    offset.y,
    scale,
  ]);

  return (
    <StyledCanvasWrapper>
      <Controls
        setView={setView}
        canvasState={{ context, offset, scale, canvasWidth, canvasHeight }}
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
          onMouseDown(
            event,
            { context, offset, scale, canvasWidth, canvasHeight },
            () => startPan(event)
          )
        }
        onDoubleClick={(event: React.MouseEvent) =>
          handleDoubleClick(event, {
            context,
            offset,
            scale,
            canvasWidth,
            canvasHeight,
          })
        }
      />
    </StyledCanvasWrapper>
  );
}
