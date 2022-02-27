import * as React from "react";
import styled from "styled-components/macro";
import logo from "../../img/thermalmodel-logo.png";
import config from "../../config";

const StyledImg = styled.img`
  height: ${config.headerHeightPx}px;
  padding: 3px;
`;

export default function Logo(): React.ReactElement {
  return <StyledImg src={logo} />;
}
