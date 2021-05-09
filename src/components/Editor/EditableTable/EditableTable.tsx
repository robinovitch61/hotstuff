import * as React from "react";
import { useCallback, useState } from "react";
import styled from "styled-components";
import TableRow from "./TableRow";

// TODO:
// [] sticky default values, with escape to edit input and keep default value
// [] StringBox, BooleanBox
// [] Generic type inputs

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-sizing: content-box;

  th {
    border: 1px solid lightgrey;
    cursor: pointer;
  }

  td {
    border: 1px solid #ddd;
    width: 45%;
    height: 1.5em;
    text-align: start;

    &:first-of-type {
      padding: 10px 15px;
    }

    &:last-of-type {
      border: none;
      width: 10%;
    }
  }

  input[type="number"] {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0;
    text-align: center;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .remove-btn {
    margin-left: 10px;
    padding: 10px;
    color: red;
    opacity: 0;
    cursor: pointer;
    font-size: 1.7rem;
  }

  tr:hover .remove-btn {
    opacity: 1;
  }
`;

const StyledTableWrapper = styled.div``;

export type SortDirection = "ASC" | "DESC";
export type SortState<T> = { key: keyof T; direction: SortDirection };

type SortableHeaderProps<T> = {
  label: string;
  sortState: SortState<T>;
  sortKey: keyof RegionData;
  toggleSortDirection: (
    sortKey: keyof RegionData,
    direction: SortDirection
  ) => void;
};

function SortableHeader<T>(props: SortableHeaderProps<T>) {
  const isSortedColumn = props.sortKey === props.sortState.key;
  const reverseDirection = props.sortState.direction === "ASC" ? "DESC" : "ASC";
  const sortIcon = props.sortState.direction === "ASC" ? "🔼" : "🔽";
  const headerLabel = `${props.label} ${isSortedColumn ? sortIcon : ""}`;

  return (
    <th
      onClick={() =>
        props.toggleSortDirection(
          props.sortKey,
          !isSortedColumn ? "ASC" : reverseDirection
        )
      }
    >
      <h4>{headerLabel}</h4>
    </th>
  );
}

export type Column<T> = {
  text: string;
  key: keyof T;
  cellType: "numeric" | "text" | "boolean";
  width: number; // 0 to 1
};

type EditableTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onUpdateRow: () => void;
  onDeleteRow: (data: T) => void;
  // toggleSortDirection: (sortKey: keyof T, sortDirection: SortDirection) => void;
  sortState?: SortState<T>;
};

export default function EditableTable<T>(
  props: EditableTableProps<T>
): React.ReactElement {
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
        <thead>
          <tr>
            <SortableHeader
              label="STATE NAME"
              sortState={props.sortState}
              sortKey="regionName"
              toggleSortDirection={props.toggleSortDirection}
            />
            <SortableHeader
              label="VALUE"
              sortState={props.sortState}
              sortKey="value"
              toggleSortDirection={props.toggleSortDirection}
            />
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
