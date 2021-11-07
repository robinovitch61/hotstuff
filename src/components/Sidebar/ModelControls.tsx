import * as React from "react";
import styled from "styled-components/macro";
import EditableNumberInput from "./EditableNumberInput";
import { AppState, Timing } from "../../App";
import { useState } from "react";
import { defaultAppState } from "../../default";

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

const StyledButton = styled.button`
  margin-top: 5px;
  margin-bottom: 5px;
`;

const StyledImport = styled.div``;

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
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onRunModel: () => void;
  timing: Timing;
  setTiming: (newTiming: Timing) => void;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  const { onRunModel, timing, setTiming } = props;
  const [stagedAppState, setStagedAppState] = useState<string>("");

  return (
    <StyledModelControlsWrapper>
      <StyledTimeControls>
        <StyledTimeControl>
          <StyledLabel>Run Time [s]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={timing.totalTimeS}
              onBlur={(newTotalTimeS: number) =>
                setTiming({ ...timing, totalTimeS: newTotalTimeS })
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
                setTiming({
                  ...timing,
                  timeStepS: newTimeStepS,
                })
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
      </StyledTimeControls>
      <StyledButton onClick={onRunModel}>Run Model</StyledButton>

      <StyledButton
        onClick={() =>
          navigator.clipboard.writeText(JSON.stringify(props.appState))
        }
      >
        Copy Model to ClipBoard
      </StyledButton>
      <StyledImport>
        <input
          value={stagedAppState}
          onChange={(event) => setStagedAppState(event.target.value)}
        />
        <StyledButton
          onClick={() => {
            props.setAppState(JSON.parse(stagedAppState));
            setStagedAppState("");
          }}
        >
          Import Model
        </StyledButton>
      </StyledImport>

      <StyledButton onClick={() => props.setAppState(defaultAppState)}>
        Reset to Tutorial
      </StyledButton>
    </StyledModelControlsWrapper>
  );
}
