import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import { Point } from "../../utils/pointUtils";
import CanvasControls from "./CanvasControls";
import useOnClickCanvas from "./hooks/useOnClickCanvas";
import { ModalState } from "../../App";
import ModalControls from "./ModalControls";

const StyledCanvasWrapper = styled.div`
  display: block;
  max-height: 100%;
  position: relative;
`;

const StyledCanvas = styled.canvas<{ cssWidth: number; cssHeight: number }>`
  width: ${({ cssWidth }) => `${cssWidth}px`};
  height: ${({ cssHeight }) => `${cssHeight}px`};
`;

export type CanvasViewState = {
  offset: Point;
  scale: number;
};

export type CanvasState = {
  context: CanvasRenderingContext2D | null;
  canvasViewState: CanvasViewState;
  canvasWidth: number;
  canvasHeight: number;
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
  canvasViewState: CanvasViewState;
  setCanvasViewState: (newCanvasState: CanvasViewState) => void;
  savedCanvasViewState: CanvasViewState;
  setSavedCanvasViewState: (newSavedCanvasState: CanvasViewState) => void;
  setKeyboardActive: React.Dispatch<React.SetStateAction<boolean>>;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

export default function Canvas(props: CanvasProps): React.ReactElement {
  const {
    canvasWidth,
    canvasHeight,
    devicePixelRatio,
    draw,
    onMouseDown,
    handleDoubleClick,
    canvasViewState,
    setCanvasViewState,
    savedCanvasViewState,
    setSavedCanvasViewState,
    setKeyboardActive,
    setModalState,
  } = props;

  // hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useOnClickCanvas(canvasRef, setKeyboardActive);
  const [context, setContext, startPan] = usePanZoomCanvas(
    canvasRef,
    canvasViewState,
    setCanvasViewState
  );

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      setContext(renderCtx);
    }
  }, [setContext]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas
      context.canvas.width = canvasWidth * devicePixelRatio;
      context.canvas.height = canvasHeight * devicePixelRatio;

      context.scale(
        canvasViewState.scale * devicePixelRatio,
        canvasViewState.scale * devicePixelRatio
      );
      context.translate(canvasViewState.offset.x, canvasViewState.offset.y);

      draw(context);
    }
  }, [
    canvasHeight,
    canvasWidth,
    context,
    devicePixelRatio,
    draw,
    canvasViewState.offset.x,
    canvasViewState.offset.y,
    canvasViewState.scale,
  ]);

  return (
    <StyledCanvasWrapper>
      <ModalControls setModalState={setModalState} />
      <CanvasControls
        setCanvasViewState={setCanvasViewState}
        canvasState={{
          context,
          canvasViewState,
          canvasWidth,
          canvasHeight,
        }}
        savedCanvasState={savedCanvasViewState}
        setSavedCanvasState={setSavedCanvasViewState}
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
            { context, canvasViewState, canvasWidth, canvasHeight },
            () => startPan(event)
          )
        }
        onDoubleClick={(event: React.MouseEvent) =>
          handleDoubleClick(event, {
            context,
            canvasViewState,
            canvasWidth,
            canvasHeight,
          })
        }
      />
    </StyledCanvasWrapper>
  );
}
