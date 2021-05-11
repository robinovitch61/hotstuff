import * as React from "react";
import styled from "styled-components/macro";
import TableRow from "./TableRow";
import SortableTableHeader, { SortState } from "./SortableTableHeader";

// TODO:
// [] sticky default values, with escape to edit input and keep default value
// [] StringBox, BooleanBox
// [] Generic type inputs

const StyledTableWrapper = styled.div`
  width: 100%;
`;

const StyledTable = styled.div`
  width: 100%;
  border-collapse: collapse;
  box-sizing: content-box;
`;

const StyledTableBody = styled.div`
  width: 100%;
`;

export type Column<T> = {
  text: string;
  key: keyof T;
  // cellType: "numeric" | "text" | "boolean";
  width: number; // 0 to 1
  minWidthPx?: number;
};

export type EditableTableProps<T> = {
  columns: Column<T>[];
  rowData: T[];
  onUpdateRow: (data: T) => void;
  onDeleteRow: (data: T) => void;
  onUpdateSortState: (sortState: SortState<T>) => void;
  sortState?: SortState<T>;
};

export default function EditableTable<T>(
  props: EditableTableProps<T>
): React.ReactElement {
  const tableRows = props.rowData.map((row, index) => {
    return (
      <TableRow<T>
        key={index}
        columns={props.columns}
        data={row}
        onUpdateRow={props.onUpdateRow}
        onDeleteRow={props.onDeleteRow}
        isDeletable
      />
    );
  });

  return (
    <StyledTableWrapper>
      <StyledTable>
        <SortableTableHeader
          columns={props.columns}
          sortState={props.sortState}
          updateSortState={props.onUpdateSortState}
        />
        <StyledTableBody>{tableRows}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
