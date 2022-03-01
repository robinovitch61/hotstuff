import * as React from "react";
import { AppState, ModalState } from "../../App";
import styled from "styled-components/macro";
import { StyledButton } from "../../style";
import { defaultAppState } from "../../default";
import { ModelOutput } from "hotstuff-network";

const StyledHeaderControls = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-left: 1.5em;
`;

const StyledHeaderControlButton = styled(StyledButton)`
  margin-right: 1em;
`;

type HeaderControlsProps = {
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setOutput: React.Dispatch<React.SetStateAction<ModelOutput | undefined>>;
};

export default function HeaderControls(
  props: HeaderControlsProps
): React.ReactElement {
  const { setModalState, setAppState, setOutput } = props;

  return (
    <StyledHeaderControls>
      <StyledHeaderControlButton
        onClick={() => setModalState({ visible: true, type: "theory" })}
      >
        Theory
      </StyledHeaderControlButton>
      <StyledHeaderControlButton
        onClick={() => setModalState({ visible: true, type: "tutorial" })}
      >
        Tutorial
      </StyledHeaderControlButton>
      <StyledHeaderControlButton
        onClick={() => setModalState({ visible: true, type: "about" })}
      >
        About
      </StyledHeaderControlButton>

      <StyledHeaderControlButton
        primary
        onClick={() =>
          setModalState((prev) => ({
            ...prev,
            visible: true,
            type: "confirm",
            onConfirm: () => {
              setAppState(defaultAppState);
              setOutput(undefined);
            },
            confirmText: [
              "This will reset the entire model, discarding all your current nodes, connections, parameters and results.",
              "Overwrite everything with an example model?",
            ],
          }))
        }
      >
        Show Me an Example
      </StyledHeaderControlButton>
    </StyledHeaderControls>
  );
}
