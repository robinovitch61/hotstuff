import React, { useState } from "react";
import styled from "styled-components/macro";

const StyledCheckbox = styled.div`
  display: inline-flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

export type BooleanTableCellProps = {
  initialIsActive?: boolean;
  onClick: (isActive: boolean) => void;
  showWhenActive: string;
};

export default function BooleanTableCell(
  props: BooleanTableCellProps
): React.ReactElement {
  const [isActive, setIsActive] = useState<boolean>(
    props.initialIsActive !== undefined ? props.initialIsActive : false
  );

  return (
    <StyledCheckbox
      tabIndex={0}
      onKeyUp={(event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          setIsActive(!isActive);
          props.onClick(!isActive);
        }
      }}
      onClick={() => {
        setIsActive(!isActive);
        props.onClick(!isActive);
      }}
    >
      &nbsp;{isActive ? props.showWhenActive : ""}
    </StyledCheckbox>
  );
}
