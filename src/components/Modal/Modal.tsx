import * as React from "react";
import { useRef } from "react";
import { ModalState } from "../../App";
import styled from "styled-components/macro";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import ConfirmationModal from "./ConfirmationModal";

const StyledModal = styled.div<{ visible: boolean }>`
  position: absolute;
  left: 50px;
  top: 50px;
  right: 50px;
  bottom: 50px;
  border: 3px solid black;
  z-index: 10;
  background: white;
  display: ${(props) => (props.visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
`;

const StyledExitButton = styled.button`
  position: absolute;
  right: 1em;
  top: 1em;
  font-size: 1.2em;
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
  } else {
    return <h1>{type}</h1>;
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
        X
      </StyledExitButton>
      {modalContent}
    </StyledModal>
  );
}
