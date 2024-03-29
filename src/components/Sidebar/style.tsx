import styled from "styled-components/macro";
import config from "../../config";

export const StyledInput = styled.input<{ fontSize?: string }>`
  display: inline-block;
  border: none;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 0;
  background: unset;
  font-size: ${(props) => props.fontSize || ""};

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const StyledEditor = styled.div<{ width: number; height: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  border-left: ${config.borderWidthPx}px solid black;
`;

export const StyledTables = styled.div<{ heightFrac: number }>`
  display: inline-flex;
  width: 100%;
  height: ${(props) => props.heightFrac * 100}%;
  position: relative;
`;

export const StyledModelControlsWrapper = styled.div<{ heightFrac: number }>`
  display: inline-flex;
  width: 100%;
  height: ${(props) => props.heightFrac * 100}%;
  position: relative;
`;
