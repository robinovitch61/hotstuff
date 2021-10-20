import * as React from "react";
import styled from "styled-components/macro";
import { Point } from "./pointUtils";

const StyledBottomLeftButton = styled.button`
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
  context: CanvasRenderingContext2D | null;
  offset: Point;
  scale: number;
  setView: (
    canvas: CanvasRenderingContext2D,
    offset: Point,
    scale: number
  ) => void;
  savedOffset: Point;
  setSavedOffset: React.Dispatch<React.SetStateAction<Point>>;
  savedScale: number;
  setSavedScale: React.Dispatch<React.SetStateAction<number>>;
};

export default function Controls(props: ControlsProps): React.ReactElement {
  return (
    <>
      <StyledBottomLeftButton
        onClick={() => {
          props.setSavedOffset(props.offset);
          props.setSavedScale(props.scale);
        }}
      >
        Save View
      </StyledBottomLeftButton>
      <StyledBottomRightButton
        onClick={() =>
          props.context &&
          props.setView(props.context, props.savedOffset, props.savedScale)
        }
      >
        Reset View
      </StyledBottomRightButton>
    </>
  );
}
