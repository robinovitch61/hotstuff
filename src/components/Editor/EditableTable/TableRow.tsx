import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import BooleanTableCell from "./BooleanTableCell";
import { Column } from "./EditableTable";
import NumericalTableCell from "./NumericalTableCell";
import TextTableCell from "./TextTableCell";

const StyledRow = styled.tr`
  display: inline-flex;
  align-items: center;
  width: 100%;
`;

const StyledCell = styled.td<{ width: number }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  height: 2em;
  width: ${({ width }) => `${width * 100}%`};
`;

const StyledDeleteCell = styled(StyledCell)`
  cursor: pointer;
  user-select: none;

  &:hover {
    background: black;
  }
`;

export type TableRowProps<T> = {
  columns: Column<T>[];
  data: T;
  onUpdateRow: (data: T) => void;
  onDeleteRow: (data: T) => void;
  isDeletable: boolean;
};

export default function TableRow<T>(
  props: TableRowProps<T>
): React.ReactElement {
  console.log(props);
  return (
    <StyledRow>
      {props.columns.map((col) => {
        const cell =
          typeof props.data[col.key] === "number" ? (
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
          <StyledCell key={col.key.toString()} width={col.width}>
            {cell}
          </StyledCell>
        );
      })}

      {!!props.isDeletable && (
        <StyledDeleteCell
          width={0.1}
          onClick={() => props.onDeleteRow(props.data)}
        >
          ❌
        </StyledDeleteCell>
      )}
    </StyledRow>
  );
}
