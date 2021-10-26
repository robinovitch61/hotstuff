import * as React from "react";
import styled from "styled-components/macro";
import { Point } from "../../utils/pointUtils";
import { CanvasState, SavedCanvasState } from "./Canvas";

const StyledBottomLeftButton = styled.button`
  //-webkit-user-select: none; /* Chrome/Safari */
  //-moz-user-select: none; /* Firefox */
  //-ms-user-select: none; /* IE10+ */
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0.2em;
`;

const StyledBottomRightButton = styled(StyledBottomLeftButton)`
  left: unset;
  right: 0;
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
    <>
      <StyledBottomLeftButton
        onClick={() => {
          props.setSavedCanvasState({
            offset: props.canvasState.offset,
            scale: props.canvasState.scale,
          });
        }}
      >
        Save View
      </StyledBottomLeftButton>
      <StyledBottomRightButton
        onClick={() =>
          props.canvasState.context &&
          props.setView(
            props.canvasState.context,
            props.savedCanvasState.offset,
            props.savedCanvasState.scale
          )
        }
      >
        Reset View
      </StyledBottomRightButton>
    </>
  );
}
