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
  onDeleteRow: (data: T) => void;
  data: T;
  columns: Column<T>[];
  updateRow: (data: T) => void;
  deleteable: boolean;
};

export default function TableRow<T>(
  props: TableRowProps<T>
): React.ReactElement {
  const [rowData, setRowData] = useState<T>(props.data);

  useEffect(() => {
    props.updateRow(rowData);
  }, [props, rowData]);

  return (
    <StyledRow>
      {props.columns.map((col) => {
        const cell =
          col.cellType === "numeric" ? (
            <NumericalTableCell
              initialVal={props.data[`${col.key}`]}
              onBlur={(newVal) => setRowData({ ...rowData, [col.key]: newVal })}
            />
          ) : col.cellType === "text" ? (
            <TextTableCell
              initialVal={props.data[`${col.key}`]}
              onBlur={(newVal) => setRowData({ ...rowData, [col.key]: newVal })}
            />
          ) : (
            <BooleanTableCell
              initialIsActive={props.data[`${col.key}`]}
              onClick={(isActive) =>
                setRowData({ ...rowData, [col.key]: !isActive })
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

      {!!props.deleteable && (
        <StyledDeleteCell
          width={0.1}
          onClick={() => props.onDeleteRow(rowData)}
        >
          ❌
        </StyledDeleteCell>
      )}
    </StyledRow>
  );
}
