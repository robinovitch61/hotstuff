import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import BooleanTableCell from "./BooleanTableCell";
import { Column, IDHavingThing } from "./EditableTable";
import NumericalTableCell from "./NumericalTableCell";
import DropDownTableCell from "./DropDownTableCell";
import TextTableCell from "./TextTableCell";

const StyledRow = styled.div<{ heightOffsetPx?: number }>`
  display: inline-flex;
  align-items: center;
  width: 100%;
  position: sticky;
  top: ${({ heightOffsetPx }) =>
    heightOffsetPx ? `${heightOffsetPx}px` : "0px"};
`;

const StyledCell = styled.div<{ width: number; minWidth?: number }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  height: 2em;
  width: ${({ width }) => `${width * 100}%`};
  min-width: ${({ minWidth }) => (!!minWidth ? `${minWidth}px` : "none")};
`;

const StyledDeleteCell = styled(StyledCell)`
  cursor: pointer;
  user-select: none;
  min-width: 40px;

  &:hover {
    background: black;
  }
`;

export type TableRowProps<T extends IDHavingThing> = {
  columns: Column<T>[];
  data: T;
  onUpdateRow: (data: T) => void;
  onDeleteRow: (data: T) => void;
  isDeletable: boolean;
  heightOffsetPx?: number;
};

export default function TableRow<T extends IDHavingThing>(
  props: TableRowProps<T>
): React.ReactElement {
  return (
    <StyledRow heightOffsetPx={props.heightOffsetPx}>
      {props.columns.map((col) => {
        const cell =
          !!col.options && col.options.length > 0 && col.onSelectOption ? (
            <DropDownTableCell
              rowId={props.data.id}
              options={col.options}
              initialVal={
                col.options.filter(
                  (option) =>
                    option.value === (props.data[col.key] as any) ||
                    option.text === (props.data[col.key] as any)
                )[0].value
              }
              onSelectOption={col.onSelectOption}
            />
          ) : typeof props.data[col.key] === "number" ? (
            <NumericalTableCell
              initialVal={props.data[col.key] as any} // TODO
              onBlur={(newVal) =>
                props.onUpdateRow({ ...props.data, [col.key]: newVal })
              }
            />
          ) : typeof props.data[col.key] === "string" ? (
            <TextTableCell
              initialVal={props.data[col.key] as any} // TODO
              onBlur={(newVal) =>
                props.onUpdateRow({ ...props.data, [col.key]: newVal })
              }
            />
          ) : (
            <BooleanTableCell
              initialIsActive={props.data[col.key] as any} // TODO
              onClick={(isActive) =>
                props.onUpdateRow({ ...props.data, [col.key]: !isActive })
              }
              showWhenActive={"✅"}
            />
          );
        return (
          <StyledCell
            key={col.key.toString()}
            width={col.width}
            minWidth={col.minWidthPx}
          >
            {cell}
          </StyledCell>
        );
      })}

      {!!props.isDeletable && (
        <StyledDeleteCell
          width={0.1}
          minWidth={40}
          onClick={() => props.onDeleteRow(props.data)}
        >
          ❌
        </StyledDeleteCell>
      )}
    </StyledRow>
  );
}
