import React, { useState } from "react";
import styled from "styled-components/macro";
import config from "../../config";

const StyledTabsWrapper = styled.div`
  display: inline-flex;
  width: 100%;
  flex-direction: column;
  overflow: auto;
  position: relative;
`;

const StyledTabs = styled.div`
  display: inline-flex;
  width: 100%;
  height: ${config.tabHeightPx}px;
  justify-content: space-evenly;
  position: sticky;
  top: 0;
  left: 0;
  background: white;
  box-sizing: border-box;
  z-index: 1;
`;

const StyledTab = styled.button<{ width: number; active: boolean }>`
  display: inline-flex;
  font-size: 16px;
  width: ${({ width }) => `${width * 100}%`};
  cursor: pointer;
  text-decoration: none;
  align-items: center;
  background: ${(props) =>
    props.active ? config.tabColor : config.inactiveTabColor};
  //background: rgb(85, 9, 121);
  //background: linear-gradient(
  //  90deg,
  //  rgba(46, 228, 233, 1) 0%,
  //  rgba(46, 228, 233, 1) 40%,
  //  rgba(255, 0, 230, 1) 80%,
  //  rgba(85, 9, 121, 1) 100%
  //);
  border-radius: 5px 5px 0 0;
  border: 1px solid black;
  border-bottom: 2px solid black;
  white-space: nowrap;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;

const StyledTabText = styled.div<{ active: boolean }>`
  font-size: 1.1em;
  font-weight: ${(props) => (props.active ? "bold" : "unset")};
  opacity: ${(props) => (props.active ? 1 : "inherit")};
  text-decoration: ${(props) => (props.active ? "underline" : "unset")};
  }
`;

const StyledInnerContent = styled.div<{ topLeftRounded: boolean }>`
  background: white;
  position: relative;
`;

type Tab = {
  text: string;
  component: React.ReactElement;
  after?: React.ReactElement;
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
            const active = idx === activeIdx;
            return (
              <StyledTab
                key={tab.text}
                tabIndex={0}
                onClick={() => setActiveIdx(idx)}
                onKeyUp={(event: React.KeyboardEvent) => {
                  if (event.key === "Enter") {
                    setActiveIdx(idx);
                  }
                }}
                width={tab.width}
                active={active}
              >
                <StyledTabText active={active}>{tab.text}</StyledTabText>
              </StyledTab>
            );
          })}
        </StyledTabs>
      )}

      <StyledInnerContent topLeftRounded={props.tabs.length <= 1}>
        {props.tabs.filter((_, idx) => idx === activeIdx)[0].component}
      </StyledInnerContent>

      {props.tabs.filter((_, idx) => idx === activeIdx)[0].after}
    </StyledTabsWrapper>
  );
}
