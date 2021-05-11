import React, { useState } from "react";
import styled from "styled-components/macro";

const StyledTabsWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
  position: relative;
`;

const StyledTabs = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-evenly;
  border-bottom: 1px solid black;
  position: sticky;
  top: 0;
`;

const StyledTab = styled.div`
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  background: lightgray;
  /* background: rgb(85, 9, 121);
  background: linear-gradient(
    90deg,
    rgba(85, 9, 121, 1) 0%,
    rgba(255, 0, 230, 1) 49%,
    rgba(46, 228, 233, 1) 100%
  ); */
  border-radius: 5px 5px 0 0;
  border: 1px solid black;

  &:hover {
    opacity: 0.75;
  }
`;

const StyledTabText = styled.div`
  font-size: 1.1em;
  padding: 0.2em 0.5em;

  &.active {
    font-weight: bold;
  }
`;

const StyledInnerContent = styled.div<{ topLeftRounded: boolean }>`
  border-radius: ${({ topLeftRounded }) =>
    `${topLeftRounded ? "20px" : "0"} 20px 20px 20px`};
  background: white;
`;

type Tab = {
  text: string;
  component: React.ReactElement;
  width: number; // between 0 and 1
};

export type TabsProps = {
  tabs: Tab[];
};

export default function Tabs(props: TabsProps): React.ReactElement {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <StyledTabsWrapper>
      {props.tabs.length > 1 && (
        <StyledTabs>
          {props.tabs.map((tab, idx) => {
            return (
              <StyledTab
                key={tab.text}
                onClick={() => setActiveIdx(idx)}
                style={{ width: `${tab.width * 100}%` }}
              >
                <StyledTabText className={idx === activeIdx ? "active" : ""}>
                  {tab.text}
                </StyledTabText>
              </StyledTab>
            );
          })}
        </StyledTabs>
      )}

      <StyledInnerContent topLeftRounded={props.tabs.length <= 1}>
        {props.tabs.filter((_, idx) => idx === activeIdx)[0].component}
      </StyledInnerContent>
    </StyledTabsWrapper>
  );
}
