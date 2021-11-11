import * as React from "react";
import styled from "styled-components/macro";

const StyledTheoryModal = styled.div`
  width: 80%;
  max-width: 1200px;
`;

const StyledTitle = styled.h1``;

const StyledText = styled.p``;

const StyledLink = styled.a``;

const StyledTheoryText = styled.p`
  font-size: 1.5em;
  font-weight: bold;
  max-width: 800px;
  text-align: center;
`;

const StyledTheoryButtons = styled.div`
  display: flex;
`;

const StyledTheoryButton = styled.button`
  font-size: 1.5em;
  margin-left: 1em;
  margin-right: 1em;
  min-width: 100px;
`;

export default function TheoryModal(): React.ReactElement {
  return (
    <StyledTheoryModal>
      <StyledTitle>How Does this Thermal Model Work?</StyledTitle>
      <StyledText>
        The thermal model used by hotstuff.network is a simple, linear,
        &quot;state space&quot; numerical model based off the following
        equation:
      </StyledText>
      <StyledText>
        The source code for the entire model can be seen{" "}
        <StyledLink
          href={
            "https://github.com/robinovitch61/hotstuff.network/tree/main/packages/hotstuff-network"
          }
          target={"_blank"}
          rel="noreferrer"
        >
          here as a standalone npm package
        </StyledLink>{" "}
        - contributions are welcome!
      </StyledText>
    </StyledTheoryModal>
  );
}
