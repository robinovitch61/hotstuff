import * as React from "react";
import { useState } from "react";
import styled from "styled-components/macro";
import EditableNumberInput from "./EditableNumberInput";
import { AppState, ModalState, Timing } from "../../App";
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
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  onRunModel: () => void;
  setTiming: (newTiming: Timing) => void;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  const { appState, setAppState, setModalState, onRunModel, setTiming } = props;

  const [stagedAppState, setStagedAppState] = useState<string>("");

  return (
    <StyledModelControlsWrapper>
      <StyledTimeControls>
        <StyledTimeControl>
          <StyledLabel>Run Time [s]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={appState.timing.totalTimeS}
              onBlur={(newTotalTimeS: number) =>
                setTiming({ ...appState.timing, totalTimeS: newTotalTimeS })
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
        <StyledTimeControl>
          <StyledLabel>Time Step [s]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={appState.timing.timeStepS}
              onBlur={(newTimeStepS: number) =>
                setTiming({
                  ...appState.timing,
                  timeStepS: newTimeStepS,
                })
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
      </StyledTimeControls>
      <StyledButton onClick={onRunModel}>Run Model</StyledButton>

      <StyledButton
        onClick={() => navigator.clipboard.writeText(JSON.stringify(appState))}
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
            setAppState(JSON.parse(stagedAppState));
            setStagedAppState("");
          }}
        >
          Import Model
        </StyledButton>
      </StyledImport>

      <StyledButton
        onClick={() =>
          setModalState((prev) => ({
            ...prev,
            visible: true,
            type: "confirm",
            onConfirm: () => setAppState(defaultAppState),
            confirmText:
              "This will permanently reset the entire model, losing all your current nodes, connections, parameters and output data. Do you want to proceed?",
          }))
        }
      >
        Reset
      </StyledButton>
    </StyledModelControlsWrapper>
  );
}
