import * as React from "react";
import styled from "styled-components/macro";
import EditableNumberInput from "./EditableNumberInput";
import { Timing } from "../../App";

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

const StyledTimeControl = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin: 0.5em;
`;

const StyledInputWrapper = styled.div`
  max-width: 3em;
  height: 1.5em;
`;

const StyledLabel = styled.label`
  margin-right: 0.2em;
`;

export type ModelControlsProps = {
  onRunModel: () => void;
  timing: Timing;
  setTiming: React.Dispatch<React.SetStateAction<Timing>>;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  const { onRunModel, timing, setTiming } = props;

  return (
    <StyledModelControlsWrapper>
      <StyledTimeControls>
        <StyledTimeControl>
          <StyledLabel>Run Time [s]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={timing.totalTimeS}
              onBlur={(newTotalTimeS: number) =>
                setTiming((prevTiming) => ({
                  ...prevTiming,
                  totalTimeS: newTotalTimeS,
                }))
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
        <StyledTimeControl>
          <StyledLabel>Time Step [s]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={timing.timeStepS}
              onBlur={(newTimeStepS: number) =>
                setTiming((prevTiming) => ({
                  ...prevTiming,
                  timeStepS: newTimeStepS,
                }))
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
      </StyledTimeControls>
      <StyledRunButton onClick={onRunModel}>Run Model</StyledRunButton>
    </StyledModelControlsWrapper>
  );
}
