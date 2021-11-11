import * as React from "react";
import { ModalState } from "../../App";
import styled from "styled-components/macro";

const StyledModalControls = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const StyledModalControlButton = styled.button`
  margin-left: 1em;
`;

type ModalControlsProps = {
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

export default function ModalControls(
  props: ModalControlsProps
): React.ReactElement {
  const { setModalState } = props;

  return (
    <StyledModalControls>
      <StyledModalControlButton
        onClick={() => setModalState({ visible: true, type: "theory" })}
      >
        Theory
      </StyledModalControlButton>
      <StyledModalControlButton
        onClick={() => setModalState({ visible: true, type: "tutorial" })}
      >
        Tutorial
      </StyledModalControlButton>
      <StyledModalControlButton
        onClick={() => setModalState({ visible: true, type: "about" })}
      >
        About
      </StyledModalControlButton>
    </StyledModalControls>
  );
}
