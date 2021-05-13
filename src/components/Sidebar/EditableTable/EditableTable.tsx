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
`;

const StyledTableBody = styled.div`
  width: 100%;
`;

export type ColOption = {
  text: string;
  value: string;
};

export type Column<T> = {
  text: string;
  key: keyof T;
  width: number; // 0 to 1
  minWidthPx?: number;
  options?: ColOption[];
  onSelectOption?: (id: string, option: ColOption) => void;
};

export type EditableTableProps<T> = {
  columns: Column<T>[];
  rowData: T[];
  onUpdateRow: (data: T) => void;
  onDeleteRow: (data: T) => void;
  onUpdateSortState: (sortState: SortState<T>) => void;
  sortState?: SortState<T>;
  heightOffsetPx?: number;
};

export interface IDHavingThing {
  id: string;
}

export default function EditableTable<T extends IDHavingThing>(
  props: EditableTableProps<T>
): React.ReactElement {
  const tableRows = props.rowData.map((row) => {
    return (
      <TableRow<T>
        key={row.id}
        columns={props.columns}
        data={row}
        onUpdateRow={props.onUpdateRow}
        onDeleteRow={props.onDeleteRow}
        isDeletable
        heightOffsetPx={props.heightOffsetPx}
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
          heightOffsetPx={props.heightOffsetPx}
        />
        <StyledTableBody>{tableRows}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
