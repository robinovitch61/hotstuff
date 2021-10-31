import * as React from "react";
import styled from "styled-components/macro";
import { StyledInput } from "./style";

const StyledModelControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-top: 3px solid black;
  padding-top: 1em;
`;

const StyledRunButton = styled.button``;

const StyledTimeControls = styled.div``;

export type ModelControlsProps = {
  onRunModel: () => void;
  timeStepS: number;
  setTimeStepS: React.Dispatch<React.SetStateAction<number>>;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  return (
    <StyledModelControlsWrapper>
      <StyledTimeControls>
        <StyledInput
          type="number"
          value={props.timeStepS}
          onBlur={(e) => props.setTimeStepS(parseFloat(e.target.value))}
        />
      </StyledTimeControls>
      <StyledRunButton onClick={props.onRunModel}>Run Model</StyledRunButton>
    </StyledModelControlsWrapper>
  );
}
