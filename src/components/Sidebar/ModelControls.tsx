import * as React from "react";
import styled from "styled-components/macro";

const StyledModelControlsWrapper = styled.div`
  display: inline-flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-top: 3px solid black;
  padding-top: 1em;
`;

const StyledRunButton = styled.button``;

export type ModelControlsProps = {
  onRunModel: () => void;
};

export default function ModelControls(
  props: ModelControlsProps
): React.ReactElement {
  return (
    <StyledModelControlsWrapper>
      <StyledRunButton onClick={props.onRunModel}>Run Model</StyledRunButton>
    </StyledModelControlsWrapper>
  );
}
