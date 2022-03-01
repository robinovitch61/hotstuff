import * as React from "react";
import { useRef, useState } from "react";
import styled from "styled-components/macro";
import EditableNumberInput from "./EditableNumberInput";
import { AppState, ExportedAppState, Timing } from "../../App";
import { ModelOutput } from "hotstuff-network";
import {
  downloadAppStateFromAnchor,
  downloadExportedAppStateFromAnchor,
  importFileFromUser,
  nicelyFormattedJsonString,
} from "./ioUtils";
import config from "../../config";
import { StyledAnchorAsButton, StyledButton } from "../../style";

const StyledModelControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-top: ${config.borderWidthPx}px solid black;
  flex-wrap: wrap;
`;

const StyledModelControlButton = styled(StyledButton)`
  margin-top: 5px;
  margin-bottom: 5px;
`;

const StyledAnchor = styled(StyledAnchorAsButton)``;

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
  setOutput: React.Dispatch<React.SetStateAction<ModelOutput | undefined>>;
  onRunModel: () => ModelOutput | undefined;
  setTiming: (newTiming: Timing) => void;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  const { appState, setAppState, setOutput, onRunModel, setTiming } = props;

  const [stagedAppState, setStagedAppState] = useState<string>("");
  const downloadModelRef = useRef<HTMLAnchorElement>(null);
  const runAndDownloadModelRef = useRef<HTMLAnchorElement>(null);

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
        <StyledModelControlButton primary onClick={onRunModel}>
          Run Model
        </StyledModelControlButton>
        <StyledModelControlButton
          onClick={() =>
            navigator.clipboard.writeText(
              nicelyFormattedJsonString<AppState>(appState)
            )
          }
        >
          Copy Model
        </StyledModelControlButton>
        <StyledModelControlButton
          onClick={() => {
            const newOutput = onRunModel();
            navigator.clipboard.writeText(
              nicelyFormattedJsonString<ExportedAppState>({
                ...appState,
                output: newOutput,
              })
            );
          }}
        >
          Run & Copy Results
        </StyledModelControlButton>
        <StyledAnchor
          ref={downloadModelRef}
          onClick={() => downloadAppStateFromAnchor(downloadModelRef, appState)}
        >
          Download Model
        </StyledAnchor>
        <StyledAnchor
          ref={runAndDownloadModelRef}
          onClick={() => {
            const newOutput = onRunModel();
            downloadExportedAppStateFromAnchor(runAndDownloadModelRef, {
              ...appState,
              output: newOutput,
            });
          }}
        >
          Run & Download Results
        </StyledAnchor>
      </StyledTopControls>
      <StyledImport>
        <StyledLabel>Model:</StyledLabel>
        <StyledInput
          value={stagedAppState}
          onChange={(event) => setStagedAppState(event.target.value)}
        />
        <StyledModelControlButton
          onClick={() => {
            const inputObject = JSON.parse(stagedAppState);
            setAppState(inputObject);
            setOutput(inputObject.output);
            setStagedAppState("");
          }}
        >
          Import
        </StyledModelControlButton>
        <div>
          <input
            id={"file-importer"}
            type={"file"}
            accept={".json"}
            style={{ display: "none" }}
            onChange={(event) =>
              importFileFromUser(event, setAppState, setOutput)
            }
          />
          <label htmlFor={"file-importer"}>Import Model from File</label>
        </div>
      </StyledImport>
    </StyledModelControlsWrapper>
  );
}
