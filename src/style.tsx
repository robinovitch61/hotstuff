import styled from "styled-components/macro";
import config from "./config";
import { css } from "styled-components";

export const StyledApp = styled.div<{ height: number; modalOpen: boolean }>`
  display: flex;
  height: ${(props) => props.height}px;
  filter: ${(props) => (props.modalOpen ? "blur(5px)" : "unset")};
  pointer-events: ${(props) => (props.modalOpen ? "none" : "unset")};
  user-select: none;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
`;

export const StyledDraggableBorder = styled.div`
  position: absolute;
  z-index: 1;
`;

export const StyledHorizontalBorder = styled(StyledDraggableBorder)<{
  width: number;
  y: number;
  left: number;
}>`
  width: ${(props) => props.width * 100}%;
  height: 10px;
  top: ${(props) => props.y * 100}%;
  transform: translate(0, -5px);
  cursor: row-resize;
  left: ${(props) => props.left * 100}%;
`;

export const StyledVerticalBorder = styled(StyledDraggableBorder)<{
  x: number;
}>`
  height: 100%;
  width: 10px;
  left: ${(props) => props.x * 100}%;
  transform: translate(-5px, 0);
  cursor: col-resize;
`;

export const StyledWorkspace = styled.div<{ height: number; width: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
`;

export const StyledCanvas = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
`;

const sharedButtonStyles = css<{ primary?: boolean }>`
  background: ${(props) =>
    !!props.primary ? config.primaryColor : config.secondaryColor};
  color: ${(props) => (!!props.primary ? "white" : "inherit")};
  border: 1px solid black;
  padding: 0.5em 0.8em;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  text-decoration: none;
  text-align: center;

  &:focus,
  &:hover {
    opacity: 0.7;
    font-style: italic;
  }

  :focus:not(:focus-visible) {
    opacity: 1;
    font-style: unset;
  }
`;

export const StyledButton = styled.button`
  ${sharedButtonStyles}
`;

export const StyledAnchorAsButton = styled.a`
  ${sharedButtonStyles}
`;
