import * as React from "react";
import { ModalState } from "../../App";
import styled from "styled-components/macro";

const StyledConfirmationModal = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2em;
  justify-content: center;
  align-items: center;
  line-height: 1.8em;
`;

const StyledConfirmationText = styled.p`
  margin: 0.8em;
  font-size: 1.5em;
  font-weight: bold;
  max-width: 800px;
  text-align: center;
`;

const StyledConfirmationButtons = styled.div`
  display: flex;
`;

const StyledConfirmationButton = styled.button`
  font-size: 1.5em;
  margin-left: 1em;
  margin-right: 1em;
  min-width: 100px;
`;

type ConfirmationModalProps = {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

export default function ConfirmationModal(
  props: ConfirmationModalProps
): React.ReactElement {
  const { modalState, setModalState } = props;

  return (
    <StyledConfirmationModal>
      {modalState.confirmText &&
        modalState.confirmText.map((text) => (
          <StyledConfirmationText key={text}>{text}</StyledConfirmationText>
        ))}
      <StyledConfirmationButtons>
        <StyledConfirmationButton
          onClick={() => setModalState((prev) => ({ ...prev, visible: false }))}
        >
          No
        </StyledConfirmationButton>
        <StyledConfirmationButton
          onClick={() => {
            modalState.onConfirm && modalState.onConfirm();
            setModalState((prev) => ({ ...prev, visible: false }));
          }}
        >
          Yes
        </StyledConfirmationButton>
      </StyledConfirmationButtons>
    </StyledConfirmationModal>
  );
}
