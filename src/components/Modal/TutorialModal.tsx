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

export default function TutorialModal(): React.ReactElement {
  return (
    <StyledModalContent>
      <StyledTitle>How to Use This Website</StyledTitle>

      <StyledSubTitle>Canvas Controls</StyledSubTitle>
      <ul>
        <li>Click a node to select it</li>
        <li>Click and drag a node to move it</li>
        <li>Double click a node to move the label position</li>
        <li>Delete to remove selected nodes</li>
        <li>Meta + Click and drag to select multiple nodes</li>
        <li>Meta + A to select all nodes</li>
        <li>Escape to deselect all nodes</li>
        <li>Meta + C to copy selected nodes</li>
        <li>Meta + V to paste copied nodes</li>
        <li>Double click to add a new node</li>
        <li>
          Hold Alt and click, drag, and release between nodes to connect them
        </li>
        <li>
          Edit or add node and connection properties in the tables on the right
        </li>
        <li>Click Run Model to view results in graphs on bottom left</li>
        <li>Connection thicknesses represent relative thermal resistance</li>
        <li>Node colors represent relative initial temperatures</li>
      </ul>

      <StyledSubTitle>Thermal Resistance Calculation</StyledSubTitle>
      <StyledText>
        Nodes can be thermally connected through Conduction, Convection, or
        Radiation, and potentially have more than one thermal connection type at
        once, e.g. a conductive connection and a radiative connection. The user
        should calculate thermal resistance differently depending on the type of
        connection, as follows:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`R_{conduction} = \frac{L}{kA} \quad \text{units:} \Big{[}\frac{K}{W}\Big{]}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`L`} /> is the
          conduction length, in meters{" "}
          <MathComponent display={false} tex={String.raw`[m]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`k`} /> is the{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_conductivity"}
            target={"_blank"}
          >
            Thermal Conductivity
          </StyledLink>
          , in Watts per meter per degrees Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{W}{mK}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the
          conduction area, in meters squared{" "}
          <MathComponent display={false} tex={String.raw`[m^2]`} />
        </StyledListItem>
      </ul>

      <MathComponent
        display={true}
        tex={String.raw`R_{convection} = \frac{1}{hA} \quad \text{units:} \Big{[}\frac{K}{W}\Big{]}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`h`} /> is the{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_transfer_coefficient"}
            target={"_blank"}
          >
            Convective Heat Transfer Coefficient
          </StyledLink>
          , in Watts per meters squared per degrees Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{W}{m^2K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the
          convection area, in meters squared{" "}
          <MathComponent display={false} tex={String.raw`[m^2]`} />
        </StyledListItem>
      </ul>

      <MathComponent
        display={true}
        tex={String.raw`R_{radiation} = \frac{1}{\epsilon \sigma A} \quad \text{units:} \Big{[}\frac{K^4}{W}\Big{]}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\epsilon`} /> is the{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Emissivity"}
            target={"_blank"}
          >
            Emissivity
          </StyledLink>
          , a unit-less quantity
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\sigma`} /> is the{" "}
          <StyledLink
            href={
              "https://en.wikipedia.org/wiki/Stefan%E2%80%93Boltzmann_constant"
            }
            target={"_blank"}
          >
            Stefan-Boltzmann constant
          </StyledLink>
          ,{" "}
          <MathComponent display={false} tex={String.raw`5.67 \cdot 10^{−8}`} />{" "}
          Watts per meters squared per degrees Kelvin to the fourth{" "}
          <MathComponent display={false} tex={String.raw`[\frac{W}{m^2K^4}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the radiation
          area, in meters squared{" "}
          <MathComponent display={false} tex={String.raw`[m^2]`} />
        </StyledListItem>
      </ul>

      <StyledText>
        In building your model, you&apos;re responsible for determining thermal
        resistances between nodes, thermal capacitances of nodes, and power
        generation or consumption in each node in your model. From there,
        thermalmodel.com will do the rest.
      </StyledText>
    </StyledModalContent>
  );
}
