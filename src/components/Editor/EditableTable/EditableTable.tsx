import * as React from "react";
import { useCallback, useState } from "react";
import styled from "styled-components";
import TableRow from "./TableRow";
import SortableTableHeader, { SortState } from "./SortableTableHeader";

// TODO:
// [] sticky default values, with escape to edit input and keep default value
// [] StringBox, BooleanBox
// [] Generic type inputs

const StyledTableWrapper = styled.div``;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-sizing: content-box;
`;

const StyledTableBody = styled.tbody``;

export type Column<T> = {
  text: string;
  key: keyof T;
  cellType: "numeric" | "text" | "boolean";
  width: number; // 0 to 1
};

export type EditableTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onUpdateRow: () => void;
  onDeleteRow: (data: T) => void;
  sortState?: SortState<T>;
};

export default function EditableTable<T>(
  props: EditableTableProps<T>
): React.ReactElement {
  const [sortState, setSortState] = useState<SortState<T> | undefined>(
    props.sortState
  );

  function renderTableRows() {
    return props.data.map((rowData, index) => {
      return (
        <TableRow<T>
          key={index}
          columns={props.columns}
          data={rowData}
          updateRow={props.onUpdateRow}
          onDeleteRow={() => props.onDeleteRow(rowData)}
          deleteable
        />
      );
    });
  }

  return (
    <StyledTableWrapper>
      <StyledTable>
        <SortableTableHeader
          columns={props.columns}
          sortState={sortState}
          updateSortState={setSortState}
        />
        <StyledTableBody>{renderTableRows()}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
