import * as React from "react";
import styled from "styled-components/macro";
import { ORIGIN, Point } from "../../utils/pointUtils";
import { CanvasState, SavedCanvasState } from "./Canvas";

const StyledButtons = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled.button`
  margin: 0.2em;
`;

type ControlsProps = {
  setView: (
    canvas: CanvasRenderingContext2D,
    offset: Point,
    scale: number
  ) => void;
  canvasState: CanvasState;
  savedCanvasState: SavedCanvasState;
  setSavedCanvasState: React.Dispatch<React.SetStateAction<SavedCanvasState>>;
};

export default function Controls(props: ControlsProps): React.ReactElement {
  return (
    <StyledButtons>
      <StyledButton
        onClick={() =>
          props.canvasState.context &&
          props.setView(props.canvasState.context, ORIGIN, 1)
        }
      >
        Reset View
      </StyledButton>
      <StyledButton
        onClick={() =>
          props.canvasState.context &&
          props.setView(
            props.canvasState.context,
            props.savedCanvasState.offset,
            props.savedCanvasState.scale
          )
        }
      >
        Reset View to Saved
      </StyledButton>
      <StyledButton
        onClick={() => {
          props.setSavedCanvasState({
            offset: props.canvasState.offset,
            scale: props.canvasState.scale,
          });
        }}
      >
        Save View
      </StyledButton>
    </StyledButtons>
  );
}
