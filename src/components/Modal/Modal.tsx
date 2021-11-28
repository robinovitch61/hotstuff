import * as React from "react";
import { useRef } from "react";
import { ModalState } from "../../App";
import styled from "styled-components/macro";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import ConfirmationModal from "./ConfirmationModal";
import TheoryModal from "./TheoryModal";
import { StyledExitButton } from "./style";

const StyledModal = styled.div<{ visible: boolean }>`
  font-size: 1.1em;
  line-height: 1.4em;
  position: absolute;
  width: 80vw;
  height: 90vh;
  max-width: 1400px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 3px solid black;
  z-index: 10;
  background: white;
  display: ${(props) => (props.visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
`;

function getModalContent(
  modalState: ModalState,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
): React.ReactElement {
  const type = modalState.type;

  if (type === "confirm") {
    return (
      <ConfirmationModal
        modalState={modalState}
        setModalState={setModalState}
      />
    );
  } else if (type === "theory") {
    return <TheoryModal />;
  } else {
    return <h1>Coming Soon</h1>;
  }
}

type ModalProps = {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

export default function Modal(props: ModalProps): React.ReactElement {
  const { modalState, setModalState } = props;

  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, () =>
    setModalState((prev) => ({ ...prev, visible: false }))
  );

  const modalContent = getModalContent(modalState, setModalState);

  return (
    <StyledModal ref={modalRef} visible={modalState.visible}>
      <StyledExitButton
        onClick={() =>
          setModalState((prevState) => ({
            ...prevState,
            visible: false,
          }))
        }
      >
        ❌
      </StyledExitButton>
      {modalContent}
    </StyledModal>
  );
}
