import * as React from "react";
import styled from "styled-components/macro";
import { CellOption } from "./EditableTable/types";
import { useCallback, useRef, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import config from "../../config";

const StyledDropDown = styled.div<{ isOpen: boolean }>`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  position: relative;

  &:visited {
    outline: none;
  }
`;

const StyledCurrentValue = styled.div<{ hasOptions: boolean }>`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  cursor: ${({ hasOptions }) => (hasOptions ? "pointer" : "unset")};
`;

const StyledOptions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 100%;
  left: -2px;
  right: -2px;
  border: 1px solid black;
  background: white;
  z-index: 10;
`;

const StyledOption = styled.div`
  display: flex;
  width: 100%;
  padding: 5px 0;

  &:hover {
    background: ${config.activeColor};
    cursor: pointer;
  }
`;

const StyledOptionText = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 100px;
  margin: 0 5px;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.8em;
`;

const StyledDropDownIcon = styled.div`
  padding: 2px;
  font-size: 10px;
`;

type DropDownProps = {
  value: CellOption;
  options: CellOption[];
  onChange: (newOption: CellOption) => void;
};

export default function DropDown(props: DropDownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(wrapperRef, () => setIsOpen(false));

  const hasOptions = !!props.options.length;
  const toggleOpen = useCallback(
    (isOpen: boolean): void => {
      if (hasOptions) {
        setIsOpen(!isOpen);
      }
    },
    [hasOptions]
  );

  return (
    <StyledDropDown
      isOpen={isOpen}
      ref={wrapperRef}
      tabIndex={0}
      onKeyUp={(event: React.KeyboardEvent) =>
        event.key === "Enter" && toggleOpen(isOpen)
      }
      onClick={() => toggleOpen(isOpen)}
    >
      <StyledCurrentValue hasOptions={hasOptions}>
        <StyledOptionText>{props.value.text}</StyledOptionText>
        {hasOptions && <StyledDropDownIcon>{"▼"}</StyledDropDownIcon>}
      </StyledCurrentValue>

      {isOpen && (
        <StyledOptions>
          {props.options.map((option) => (
            <StyledOption
              key={option.id}
              onClick={() => props.onChange(option)}
              tabIndex={0}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  props.onChange(option);
                  toggleOpen(isOpen);
                }
              }}
            >
              <StyledOptionText>{option.text}</StyledOptionText>
            </StyledOption>
          ))}
        </StyledOptions>
      )}
    </StyledDropDown>
  );
}
