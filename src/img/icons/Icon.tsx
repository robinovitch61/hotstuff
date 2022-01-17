import * as React from "react";
import styled from "styled-components/macro";

const StyledImg = styled.img`
  max-width: 90%;
  max-height: 90%;
`;

export default function Icon(props: { src: string }): React.ReactElement {
  return <StyledImg src={props.src} />;
}
