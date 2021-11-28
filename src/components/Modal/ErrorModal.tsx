import * as React from "react";
import styled from "styled-components/macro";
import config from "../../config";
import { StyledExitButton } from "./style";

export const StyledError = styled.div<{ isVisible: boolean }>`
  color: red;
  background: white;
  font-size: 2em;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  padding: 2em;
  z-index: 20;
  width: 80%;
  border: 1px solid red;
  opacity: 0.9;
  animation: FadeAnimation ${config.errorMessageDurationSeconds}s ease-in
    forwards;

  @keyframes FadeAnimation {
    0% {
      opacity: 0.9;
      visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
    }
    80% {
      opacity: 0.9;
      visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }
`;

type ErrorModalProps = {
  errors: string[];
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ErrorModal(props: ErrorModalProps): React.ReactElement {
  const { errors, setErrors } = props;

  if (errors.length === 0) {
    return <></>;
  }

  return (
    <StyledError isVisible={true}>
      <StyledExitButton
        onClick={() => {
          setErrors([]);
        }}
      >
        ❌
      </StyledExitButton>
      {errors.map((err) => (
        <div key={err}>{err}</div>
      ))}
    </StyledError>
  );
}
