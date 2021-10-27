import * as React from "react";
import styled from "styled-components/macro";
import TableRow from "./TableRow";
import SortableTableHeader, { SortState } from "./SortableTableHeader";

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
  id: string;
  text: string;
};

export type Column<T> = {
  text: string;
  key: keyof T;
  width: number; // 0 to 1
  minWidthPx?: number;
  options?: ColOption[];
  onSelectOption?: (id: string, option: ColOption) => void;
  optionsFilter?: (option: ColOption) => ColOption[];
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

interface StringKeyed {
  [key: string]: any;
}

export interface TableCompatibleType extends StringKeyed {
  id: string;
  isActive: boolean;
}

export default function EditableTable<T extends TableCompatibleType>(
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
        isActive={row.isActive}
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
