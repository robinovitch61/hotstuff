import React from "react";
import styled from "styled-components/macro";

const StyledModelControlsWrapper = styled.div`
  display: inline-flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
`;

const StyledRunButton = styled.button``;

export type ModelControlsProps = {
  onRunModel: () => void;
};

export default function ModelControls(props: ModelControlsProps) {
  return (
    <StyledModelControlsWrapper>
      <StyledRunButton onClick={props.onRunModel}>Run Model</StyledRunButton>
    </StyledModelControlsWrapper>
  );
}
