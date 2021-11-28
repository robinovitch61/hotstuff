import * as React from "react";
import { useState } from "react";
import styled from "styled-components/macro";
import EditableNumberInput from "./EditableNumberInput";
import { AppState, ModalState, Timing } from "../../App";
import { defaultAppState } from "../../default";
import { ModelOutput } from "hotstuff-network";

const StyledModelControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-top: 3px solid black;
  flex-wrap: wrap;
`;

const StyledButton = styled.button`
  margin-top: 5px;
  margin-bottom: 5px;
`;

const StyledImport = styled.div`
  padding: 0.2em;
  border: 1px solid black;
`;

const StyledInput = styled.input`
  margin-right: 0.5em;
`;

const StyledTopControls = styled.div`
  display: flex;
  > * {
    margin: 1em;
  }
`;

const StyledTimeControls = styled.div``;

const StyledTimeControl = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin: 0.5em;
`;

const StyledInputWrapper = styled.div`
  border: 1px solid black;
  border-radius: 2px;
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
  onRunModel: () => ModelOutput | undefined;
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
      <StyledTopControls>
        <StyledButton onClick={onRunModel}>Run Model</StyledButton>
        <StyledButton
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(appState))
          }
        >
          Copy Model
        </StyledButton>
        <StyledButton
          onClick={() => {
            const newOutput = onRunModel();
            navigator.clipboard.writeText(
              JSON.stringify({ ...appState, newOutput })
            );
          }}
        >
          Run & Copy Results
        </StyledButton>
      </StyledTopControls>
      <StyledImport>
        <StyledLabel>Model:</StyledLabel>
        <StyledInput
          value={stagedAppState}
          onChange={(event) => setStagedAppState(event.target.value)}
        />
        <StyledButton
          onClick={() => {
            setAppState(JSON.parse(stagedAppState));
            setStagedAppState("");
          }}
        >
          Import
        </StyledButton>
      </StyledImport>

      <StyledButton
        onClick={() =>
          setModalState((prev) => ({
            ...prev,
            visible: true,
            type: "confirm",
            onConfirm: () => setAppState(defaultAppState),
            confirmText: [
              "This will reset the entire model, discarding all your current nodes, connections, parameters and results.",
              "Permanently reset everything?",
            ],
          }))
        }
      >
        Reset
      </StyledButton>
    </StyledModelControlsWrapper>
  );
}
