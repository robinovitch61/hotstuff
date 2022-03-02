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
import {
  StyledAnchorAsButton,
  StyledButton,
  StyledLabelAsButton,
} from "../../style";

const StyledModelControlsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  border-top: ${config.borderWidthPx}px solid black;
  overflow: hidden;
`;

const StyledModelControlButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
`;

const StyledModelControlButton = styled(StyledButton)`
  height: 100%;
`;

const StyledCopyAndDownloadButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 50%);
  grid-gap: 0.5em;
  margin-left: 1em;
`;

const StyledAnchor = styled(StyledAnchorAsButton)``;

const StyledInput = styled.input`
  margin-right: 0.5em;
  font-size: 1.2em;
`;

const StyledTimeControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
`;

const StyledTimeControl = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const StyledInputWrapper = styled.div`
  border: 1px solid black;
  border-radius: 2px;
  height: 1.5em;
  width: 5em;
`;

const StyledImportModel = styled.div`
  display: flex;
  align-items: center;
`;

const StyledImportFromFile = styled(StyledLabelAsButton)`
  display: block;
`;

const StyledLabel = styled.label`
  margin-right: 0.2em;
  font-size: 1.5rem;
  white-space: nowrap;
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
      <StyledModelControlButtons>
        <StyledModelControlButton primary onClick={onRunModel}>
          Run Model
        </StyledModelControlButton>
        <StyledCopyAndDownloadButtons>
          <StyledModelControlButton
            onClick={() => {
              navigator.clipboard.writeText(
                nicelyFormattedJsonString<ExportedAppState>({
                  ...appState,
                  output: undefined,
                })
              );
            }}
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
            Run & Copy
          </StyledModelControlButton>
          <StyledAnchor
            ref={downloadModelRef}
            onClick={() =>
              downloadAppStateFromAnchor(downloadModelRef, appState)
            }
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
            Run & Download
          </StyledAnchor>
        </StyledCopyAndDownloadButtons>
      </StyledModelControlButtons>
      <StyledTimeControls>
        <StyledTimeControl>
          <StyledLabel>Run Time [seconds]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={appState.timing.totalTimeS}
              fontSize={config.timeControlsFontSize}
              onBlur={(newTotalTimeS: number) =>
                setTiming({ ...appState.timing, totalTimeS: newTotalTimeS })
              }
            />
          </StyledInputWrapper>
        </StyledTimeControl>
        <StyledTimeControl>
          <StyledLabel>Timestep [seconds]:</StyledLabel>
          <StyledInputWrapper>
            <EditableNumberInput
              initialValue={appState.timing.timeStepS}
              fontSize={config.timeControlsFontSize}
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
      <StyledImportModel>
        <StyledLabel>Model:</StyledLabel>
        <StyledInput
          value={stagedAppState}
          placeholder={"Paste a Model Here"}
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
          Import Pasted
        </StyledModelControlButton>
      </StyledImportModel>
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
        <StyledImportFromFile htmlFor={"file-importer"}>
          Import Model from File
        </StyledImportFromFile>
      </div>
    </StyledModelControlsWrapper>
  );
}
