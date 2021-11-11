import * as React from "react";
import styled from "styled-components/macro";
import { ORIGIN } from "../../utils/pointUtils";
import { CanvasState, CanvasViewState } from "./Canvas";

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

type CanvasControlsProps = {
  setCanvasViewState: (canvasViewState: CanvasViewState) => void;
  canvasState: CanvasState;
  savedCanvasState: CanvasViewState;
  setSavedCanvasState: (newSavedCanvasState: CanvasViewState) => void;
};

export default function CanvasControls(
  props: CanvasControlsProps
): React.ReactElement {
  return (
    <StyledButtons>
      <StyledButton
        onClick={() =>
          props.canvasState.context &&
          props.setCanvasViewState({ offset: ORIGIN, scale: 1 })
        }
      >
        Reset View
      </StyledButton>
      <StyledButton
        onClick={() =>
          props.canvasState.context &&
          props.setCanvasViewState({
            offset: props.savedCanvasState.offset,
            scale: props.savedCanvasState.scale,
          })
        }
      >
        Reset View to Saved
      </StyledButton>
      <StyledButton
        onClick={() => {
          props.setSavedCanvasState({
            offset: props.canvasState.canvasViewState.offset,
            scale: props.canvasState.canvasViewState.scale,
          });
        }}
      >
        Save View
      </StyledButton>
    </StyledButtons>
  );
}
