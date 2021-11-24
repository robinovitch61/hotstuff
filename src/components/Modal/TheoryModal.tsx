import * as React from "react";
import styled from "styled-components/macro";
import { MathComponent } from "mathjax-react";

const StyledTheoryModal = styled.div`
  width: 80%;
  max-width: 1200px;
  height: 90%;
  overflow-y: auto;
`;

const StyledTitle = styled.h1``;

const StyledText = styled.p``;

const StyledImg = styled.img`
  width: 90%;
  max-width: 700px;
`;

const StyledLink = styled.a``;

const StyledListItem = styled.li`
  margin-bottom: 1em;
`;

export default function TheoryModal(): React.ReactElement {
  return (
    <StyledTheoryModal>
      <StyledTitle>How Does hotstuff.network Work?</StyledTitle>

      <StyledText>
        The thermal model used by hotstuff.network is a linear{" "}
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
          is the sum of all heat transfer in or out in Watts [W]
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`\sum{q_{generated/consumed}}`}
          />{" "}
          is the sum of all heat generated or consumed, in Watts [W]
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
        terminology of this tool, &quot;node&quot;, can be assumed to have
        uniform temperature. A node can be assumed to be uniform temperature
        when the diffusion of heat energy within it is much greater than the
        transfer of heat into or out of it. This is quantified by a small{" "}
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
        transfer equations into the numerical form hotstuff.network uses to
        calculate node temperatures when it runs a model.
      </StyledText>

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
          <MathComponent display={false} tex={String.raw`q`} /> is heat transfer
          in Watts [W]
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
            Thermal Transmittance
          </StyledLink>{" "}
          in Watts per degree Kelvin [W/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference in degrees [degK]
        </StyledListItem>
      </ul>

      <StyledText>
        The reciprocal of Thermal Conductance is{" "}
        <StyledLink
          href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
          target={"_blank"}
        >
          Thermal Resistance
        </StyledLink>{" "}
        , <MathComponent display={false} tex={String.raw`R = 1/c`} />, measured
        in degrees Kelvin per Watt [degK/W]. For a given object or material,
        this can be thought of as the temperature difference required to get one
        Watt of heat to flow through it. Materials with higher thermal
        resistance require more of a temperature difference to achieve the same
        heat flow.
      </StyledText>

      <MathComponent display={true} tex={String.raw`q = -\frac{\Delta T}{R}`} />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`q`} /> is heat transfer
          in Watts [W]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference in degrees [degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`R`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
            target={"_blank"}
          >
            Thermal Resistance
          </StyledLink>{" "}
          in degrees Kelvin per Watt [degK/W]
        </StyledListItem>
      </ul>

      <StyledText>
        The definition of{" "}
        <StyledLink
          href={"https://en.wikipedia.org/wiki/Heat_capacity"}
          target={"_blank"}
        >
          Thermal Capacitance
        </StyledLink>{" "}
        (different than Thermal Conductance above) is the amount of heat energy
        applied to an object to produce 1 degree of temperature change in it:
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
          , or Heat Capacity, in Joules per degree Kelvin [J/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`Q`} /> is heat
          transferred in Joules [J]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference in degrees [degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dQ}{dT}`} /> is
          the rate of change of heat transfer with respect to temperature in
          Joules per degree [J/degK]
        </StyledListItem>
      </ul>

      <StyledText>
        Rearranging and differentiating the equation above with respect to time,
        we obtain the following:
      </StyledText>

      <MathComponent display={true} tex={String.raw`q = C \frac{dT}{dt}`} />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`q`} /> is heat transfer
          in Watts (i.e. Joules per Second) [W = J/s]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dT}{dt}`} /> is
          the derivative of temperature with respect to time in degrees per
          second [degK/s]
        </StyledListItem>
      </ul>

      <StyledText>
        Equating the two equations for{" "}
        <MathComponent display={false} tex={String.raw`q`} />, heat transfer in
        Watts, working out the signs, and adding in power generated or consumed,
        we obtain the following:
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
          , or Heat Capacity, in Joules per degree Kelvin [J/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\frac{dT}{dt}`} /> is
          the derivative of temperature with respect to time in degrees per
          second [degK/s]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta T`} /> is the
          temperature difference in degrees [degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`R`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_resistance"}
            target={"_blank"}
          >
            Thermal Resistance
          </StyledLink>{" "}
          in degrees Kelvin per Watt [degK/W]
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`q_{generated/consumed}`}
          />{" "}
          is the net heat generated or consumed, in Watts [W]
        </StyledListItem>
      </ul>

      <StyledText>
        This partial differential equation can be converted to a numerical
        equation with reasonable results assuming the time step between discrete
        states is small. In using hotstuff.network, you&apos;ll notice that as
        you increase the time step and rerun a model, unstable results
        eventually show up - errors compound at each step and blow up the
        temperature differences to unreasonable numbers. If you see instability,
        decrease the time step size.
      </StyledText>

      <StyledText>
        Assuming small time steps, this equation holds for each node in the
        model:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`\Delta T_{node} = \frac{\Delta{t}}{C_{node}}(\sum{\frac{T_{other\_node} - T_{node}}{R_{other\_node \leftrightarrow node}}} - q_{generated/consumed})`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta{T}_{node}`} />{" "}
          is the change in temperature of the node of interest at that time
          step, in degrees [degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`\Delta{t}`} /> is the
          time step in seconds [s]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`C_{node}`} /> is{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Heat_capacity"}
            target={"_blank"}
          >
            Thermal Capacitance
          </StyledLink>{" "}
          , or Heat Capacity, of the node of interest in Joules per degree
          Kelvin [J/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`T_{other\_node}`} /> is
          the current temperature of a node that is thermally connected with the
          node of interest in degrees [degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`T_{node}`} /> is the
          current temperature the node of interest in degrees [degK]
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
          between the two thermally connected nodes in degrees Kelvin per Watt
          [degK/W] if conduction or convection, or degrees Kelvin to the fourth
          per Watt [degK^4/W] if radiation
        </StyledListItem>
        <StyledListItem>
          <MathComponent
            display={false}
            tex={String.raw`q_{generated/consumed}`}
          />{" "}
          is the net heat generated or consumed by the node of interest, in
          Watts [W]
        </StyledListItem>
      </ul>

      <StyledText>
        Under the hood, hotstuff.network solves the above equation for each node
        at each timestep, resulting in a set of simulated temperatures for each
        node over the duration of the model.
      </StyledText>

      <StyledText>
        Boundary condition nodes do not change temperature over time. They
        influence nodes that are thermally connected to them, but their
        calculated temperature difference at each time step is discarded rather
        than added to their previous temperature.
      </StyledText>

      <StyledText>
        Nodes can be thermally connected through Conduction, Convection, or
        Radiation. The user should calculate thermal resistance differently
        depending on the type of connection, as follows:
      </StyledText>

      <MathComponent
        display={true}
        tex={String.raw`R_{conduction} = \frac{L}{kA}`}
      />

      <ul>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`L`} /> is the
          conduction length, in meters [m]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`k`} /> is the{" "}
          <StyledLink
            href={"https://en.wikipedia.org/wiki/Thermal_conductivity"}
            target={"_blank"}
          >
            Thermal Conductivity
          </StyledLink>
          , in Watts per meter per degrees Kelvin [W/m/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the
          conduction area, in meters squared [m^2]
        </StyledListItem>
      </ul>

      <MathComponent
        display={true}
        tex={String.raw`R_{convection} = \frac{1}{hA}`}
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
          , in Watts per meters squared per degrees Kelvin [W/m^2/degK]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the
          convection area, in meters squared [m^2]
        </StyledListItem>
      </ul>

      <MathComponent
        display={true}
        tex={String.raw`R_{radiation} = \frac{1}{\epsilon \sigma A}`}
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
          , 5.67 * 10^−8 Watts per meters squared per degrees Kelvin to the
          fourth [W/m^2/degK^4]
        </StyledListItem>
        <StyledListItem>
          <MathComponent display={false} tex={String.raw`A`} /> is the radiation
          area, in meters squared [m^2]
        </StyledListItem>
      </ul>

      <StyledText>
        In building your model, you&apos;ll primarily be concerned with
        determining thermal resistances between nodes, thermal capacitances of
        nodes, and power generation/consumption of each node in your model. From
        there, hotstuff.network will do the rest.
      </StyledText>

      <StyledText>
        The source code for the entire model can be seen{" "}
        <StyledLink
          href={
            "https://github.com/robinovitch61/hotstuff.network/tree/main/packages/hotstuff-network"
          }
          target={"_blank"}
        >
          here as a standalone npm package
        </StyledLink>{" "}
        - contributions are welcome!
      </StyledText>
    </StyledTheoryModal>
  );
}
