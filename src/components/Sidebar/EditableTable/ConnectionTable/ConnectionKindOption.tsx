import * as React from "react";
import { CellOption } from "../types";
import connectionKindToImgSrc from "../../../../utils/imageUtils";
import { HSConnectionKind } from "hotstuff-network";
import styled from "styled-components/macro";

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImg = styled.img`
  width: 20px;
  padding-right: 2px;
`;

export default function ConnectionKindOption(props: {
  option: CellOption;
}): React.ReactElement {
  return (
    <StyledWrapper>
      <StyledImg
        src={connectionKindToImgSrc(props.option.id as HSConnectionKind)}
      />
      {props.option.text}
    </StyledWrapper>
  );
}
