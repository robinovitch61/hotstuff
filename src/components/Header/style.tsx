import styled from "styled-components/macro";
import config from "../../config";

export const StyledHeader = styled.div<{ height: number }>`
  height: ${(props) => props.height}px;
  //border-bottom: ${config.borderWidthPx}px solid black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #dedede;
`;
