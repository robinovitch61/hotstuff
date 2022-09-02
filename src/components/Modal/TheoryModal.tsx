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

export default function TheoryModal(): React.ReactElement {
  return (
    <StyledModalContent>
      <StyledTitle>How Does thermalmodel.com Work?</StyledTitle>

      <StyledText>
        The model used by thermalmodel.com is a linear{" "}
        <StyledLink
          href={"https://en.wikipedia.org/wiki/State-space_representation"}
          target={"_blank"}
        >
          state space
        </StyledLink>{" "}
        model based off conservation of heat flow:{" "}
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`\sum{q_{in/out}} + \sum{q_{generated/consumed}} = 0`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\sum{q_{in/out}}`} />{" "}
          is the sum of all heat transfer in or out, in Watts{" "}
          <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`\sum{q_{generated/consumed}}`}
          />{" "}
          is the sum of all heat generated or consumed, in Watts{" "}
          <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
      </ul>

      <StyledText>
        The class of model is referred to as a{" "}
        <StyledLink
          href={
            "https://en.wikipedia.org/wiki/Lumped-element_model#Thermal_systems"
          }
          target={"_blank"}
        >
          Lumped-Element model
        </StyledLink>
        , which produces accurate results when each &quot;lump&quot;, or in the
        terminology of this website, &quot;node&quot;, can be assumed to have
        uniform temperature. A node can be assumed to be uniform temperature
        when the diffusion of heat within it is much greater than the transfer
        of heat into or out of it. This is quantified by a small{" "}
        <StyledLink
          href={"https://en.wikipedia.org/wiki/Biot_number"}
          target={"_blank"}
        >
          Biot number
        </StyledLink>
        .
      </StyledText>

      <StyledText>
        What follows is the definition and manipulation of fundamental heat
        transfer equations into the numerical form thermalmodel.com uses to
        calculate node temperatures when it runs a model.
      </StyledText>

      <StyledSubTitle>
        Fourier&apos;s Law and Thermal Conductance
      </StyledSubTitle>
      <StyledText>
        <StyledLink
          href={
            "https://en.wikipedia.org/wiki/Thermal_conduction#Fourier's_law"
          }
          target={"_blank"}
        >
          Fourier&apos;s Law in 1 dimension
        </StyledLink>{" "}
        states:
      </StyledText>

      <MathComponent display={true} tex={String.raw`q =-c \Delta T`} />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`q`} /> is heat
          transfer, in Watts{" "}
          <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`c`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_contact_conductance"}
            target={"_blank"}
          >
            Thermal Conductance
          </StyledLink>{" "}
          or{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_transmittance"}
            target={"_blank"}
          >
            Thermal Transmittance,
          </StyledLink>{" "}
          in Watts per degree Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{W}{K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
      </ul>

      <StyledSubTitle>Thermal Resistance</StyledSubTitle>
      <StyledText>
        The reciprocal of Thermal Conductance is{" "}
        <StyledLink
          href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
          target={"_blank"}
        >
          Thermal Resistance
        </StyledLink>{" "}
        , <MathComponent display={false} tex={String.raw`R = \frac{1}{c}`} />,
        measured in degrees Kelvin per Watt{" "}
        <MathComponent display={false} tex={String.raw`[\frac{K}{W}]`} />. A
        given object or material&apos;s Thermal Resistance can be thought of as
        the temperature difference required to get one Watt of heat to flow
        through it. A material with a higher Thermal Resistance requires a
        higher temperature difference across it to achieve the same heat flow as
        one with a lower Thermal Resistance.
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`q = -\frac{\Delta T}{R} \space\space\space[1]`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`q`} /> is heat
          transfer, in Watts{" "}
          <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`R`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
            target={"_blank"}
          >
            Thermal Resistance
          </StyledLink>
          , in degrees Kelvin per Watt{" "}
          <MathComponent display={false} tex={String.raw`[\frac{K}{W}]`} />
        </StyledListItem>
      </ul>

      <StyledSubTitle>Thermal Capacitance</StyledSubTitle>
      <StyledText>
        <StyledLink
          href={"https://en.wikipedia.org/wiki/Heat_capacity"}
          target={"_blank"}
        >
          Thermal Capacitance
        </StyledLink>{" "}
        (different than Thermal Conductance above) can be thought of as the
        amount of heat energy absorbed by an object to increase its temperature
        by 1 degree:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`C = \lim_{\Delta T \to 0} \frac{Q}{\Delta T} = \frac{dQ}{dT}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`C`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_capacity"}
            target={"_blank"}
          >
            Thermal Capacitance
          </StyledLink>{" "}
          , or Heat Capacity, in Joules per degree Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{J}{K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`Q`} /> is heat
          transfer, in Joules{" "}
          <MathComponent display={false} tex={String.raw`[J]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dQ}{dT}`} /> is
          the rate of change of heat energy with respect to temperature, in
          Joules per degree{" "}
          <MathComponent display={false} tex={String.raw`[\frac{J}{K}]`} />
        </StyledListItem>
      </ul>

      <StyledText>
        Rearranging and differentiating the equation above with respect to time,
        we obtain the following:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`q = C \frac{dT}{dt} \space\space\space[2]`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`q`} /> is heat
          transfer, in Watts (i.e. Joules per second){" "}
          <MathComponent display={false} tex={String.raw`[W = \frac{J}{s}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`C`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_capacity"}
            target={"_blank"}
          >
            Thermal Capacitance
          </StyledLink>{" "}
          , or Heat Capacity, in Joules per degree Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{J}{K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dT}{dt}`} /> is
          the derivative of temperature with respect to time, in degrees per
          second{" "}
          <MathComponent display={false} tex={String.raw`[\frac{K}{s}]`} />
        </StyledListItem>
      </ul>

      <StyledSubTitle>Model Equation</StyledSubTitle>
      <StyledText>
        We now have two equations for{" "}
        <MathComponent display={false} tex={String.raw`q`} />, heat transfer, in
        Watts. Equating these, working out the signs, and adding in power
        generated or consumed, we obtain the following:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`C \frac{dT}{dt} = \sum{\frac{\Delta T}{R}} - q_{generated/consumed}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`C`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_capacity"}
            target={"_blank"}
          >
            Thermal Capacitance
          </StyledLink>{" "}
          , or Heat Capacity, in Joules per degree Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{J}{K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dT}{dt}`} /> is
          the derivative of temperature with respect to time, in degrees per
          second{" "}
          <MathComponent display={false} tex={String.raw`[\frac{K}{s}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`R`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
            target={"_blank"}
          >
            Thermal Resistance
          </StyledLink>
          , in degrees Kelvin per Watt{" "}
          <MathComponent display={false} tex={String.raw`[\frac{K}{W}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`q_{generated/consumed}`}
          />{" "}
          is the net heat generated or consumed, in Watts{" "}
          <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
      </ul>

      <StyledText>
        This partial differential equation can be simplified to a numerical
        equation. The results of the equation are reasonable when the time step
        size between discrete states is small. You&apos;ll notice that if you
        rerun a model with too large a time step, unstable results appear - at
        high time step sizes, errors compound and blow up the temperature
        differences to unreasonable numbers. If you see instability, decrease
        the time step size and rerun your model.
      </StyledText>

      <StyledText>
        Assuming small time steps, this equation holds for each node in the
        model:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`\Delta T_{node} = \frac{\Delta{t}}{C_{node}}\left(\sum{\frac{T_{other\_node} - T_{node}}{R_{other\_node \leftrightarrow node}}} - q_{generated/consumed}\right)`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta{T}_{node}`} />{" "}
          is the change in temperature of the node of interest at that time
          step, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta{t}`} /> is the
          time step, in seconds{" "}
          <MathComponent display={false} tex={String.raw`[s]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`C_{node}`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_capacity"}
            target={"_blank"}
          >
            Thermal Capacitance
          </StyledLink>{" "}
          , or Heat Capacity, of the node of interest, in Joules per degree
          Kelvin{" "}
          <MathComponent display={false} tex={String.raw`[\frac{J}{K}]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`T_{other\_node}`} /> is
          the current temperature of a node that is thermally connected with the
          node of interest, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`T_{node}`} /> is the
          current temperature the node of interest, in degrees{" "}
          <MathComponent display={false} tex={String.raw`[K]`} />
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`R_{other\_node \leftrightarrow node}`}
          />{" "}
          is the{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
            target={"_blank"}
          >
            Thermal Resistance
          </StyledLink>{" "}
          between the two thermally connected nodes, in degrees Kelvin per Watt
          <MathComponent display={false} tex={String.raw`[\frac{K}{W}]`} /> if
          conduction or convection, or in degrees Kelvin to the fourth per Watt
          <MathComponent display={false} tex={String.raw`[\frac{K^4}{W}]`} /> if
          radiation
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`q_{generated/consumed}`}
          />{" "}
          is the net heat generated or consumed by the node of interest, in
          Watts <MathComponent display={false} tex={String.raw`[W]`} />
        </StyledListItem>
      </ul>

      <StyledText>
        Under the hood, thermalmodel.com solves the above equation for each node
        at each timestep, resulting in a set of temperature values for each node
        at each timestep over the duration of the model.
      </StyledText>

      <StyledText>
        Fixed temperature, i.e. boundary condition nodes do not change
        temperature over time. They influence nodes that are thermally connected
        to them, but their calculated temperature difference at each time step
        is discarded rather than added to their previous temperature.
      </StyledText>

      <StyledText>
        The source code for the model can be seen{" "}
        <StyledLink
          href={
            "https://github.com/robinovitch61/thermalmodel.com/tree/main/packages/hotstuff-network"
          }
          target={"_blank"}
        >
          here as a standalone Javascript package on npm
        </StyledLink>
        .
      </StyledText>
    </StyledModalContent>
  );
}
