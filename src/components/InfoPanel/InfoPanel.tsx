import * as React from "react";
import { ModalState } from "../../App";
import styled from "styled-components/macro";
import { useRef } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";

const StyledInfoPanel = styled.div<{ visible: boolean }>`
  position: absolute;
  left: 50px;
  top: 50px;
  right: 50px;
  bottom: 50px;
  border: 3px solid black;
  z-index: 10;
  background: white;
  display: ${(props) => (props.visible ? "unset" : "none")};
`;

const StyledExitButton = styled.button`
  position: absolute;
  right: 1em;
  top: 1em;
  font-size: 1.2em;
`;

type InfoPanelProps = {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

export default function InfoPanel(props: InfoPanelProps): React.ReactElement {
  const { modalState, setModalState } = props;

  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, () =>
    setModalState((prev) => ({ ...prev, visible: false }))
  );

  return (
    <StyledInfoPanel ref={modalRef} visible={modalState.visible}>
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
    </StyledInfoPanel>
  );
}
