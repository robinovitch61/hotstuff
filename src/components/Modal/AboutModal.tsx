import * as React from "react";
import { MathComponent } from "mathjax-react";
import {
  StyledLink,
  StyledListItem,
  StyledModalContent,
  StyledSubTitle,
  StyledText,
  StyledTitle,
} from "./style";

export default function AboutModal(): React.ReactElement {
  return (
    <StyledModalContent>
      <StyledTitle>About</StyledTitle>
      <StyledText>
        I&apos;m Leo, former Mechanical Engineer who now makes software. You can
        find my other stuff on the internet{" "}
        <StyledLink target="_blank" href="https://theleo.zone">
          on my website
        </StyledLink>
        .
      </StyledText>
      <StyledText>
        Improving thermalmodel.com is important to me. If you have any problems
        or requests, open a{" "}
        <StyledLink
          target="_blank"
          href="https://github.com/robinovitch61/hotstuff/issues/new"
        >
          GitHub issue here
        </StyledLink>
        .
      </StyledText>
      <StyledText>
        If you appreciate this work, you can help me out by giving the{" "}
        <StyledLink
          target="_blank"
          href="https://github.com/robinovitch61/hotstuff"
        >
          source code a Star on GitHub
        </StyledLink>{" "}
        so more people can discover it.
      </StyledText>
      <StyledText>
        <StyledLink target="_blank" href="https://ko-fi.com/robinovitch61">
          You can also donate here
        </StyledLink>
        .
      </StyledText>
    </StyledModalContent>
  );
}
