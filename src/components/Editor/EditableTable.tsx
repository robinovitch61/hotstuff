import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { RegionData } from "./Editor";

// TODO:
// [] sticky default values, with escape to edit input and keep default value
// [] StringBox, BooleanBox
// [] Generic type inputs

type NumberBoxProps = {
  value: number;
  onBlur: (newValue: number) => void;
};

function NumberBox(props: NumberBoxProps) {
  const [value, setValue] = useState<number>();

  function isFloatParseable(val: string) {
    return !isNaN(parseFloat(val));
  }

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValueText = event.target.value;
    const newValueFloat = parseFloat(event.target.value);
    console.log(newValueFloat);
    if (newValueText === undefined || newValueFloat === value) {
      return;
    }
    // // this isn't foolproof (e.g. '123.1abc' will parse), but ok for my purposes
    // if (isNaN(newValueFloat)) {
    //   return;
    // }
    setValue(newValueFloat);
  }

  function handleOnBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const newValueText = event.target.value;
    const newValueFloat = parseFloat(event.target.value);
    if (newValueText === undefined || newValueFloat === value) {
      return;
    }
    // this isn't foolproof (e.g. '123.1abc' will parse), but ok for my purposes
    if (isNaN(newValueFloat)) {
      return;
    }
    props.onBlur(newValueFloat);
  }

  return (
    <input
      type="number"
      value={value}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
}

type TableRowProps = {
  onDeleteRow: any; // TODO func sig
  data: RegionData;
  updateRow: (regionName: string, newValue: number) => void;
};

function TableRow(props: TableRowProps) {
  function handleBlur(newValue: number) {
    props.updateRow(props.data.regionName, newValue);
  }
  return (
    <tr>
      <td>{props.data.regionName}</td>
      <td>
        <NumberBox value={props.data.value} onBlur={handleBlur} />
      </td>
      <td>
        <span className="remove-btn" onClick={props.onDeleteRow}>
          ❌
        </span>
      </td>
    </tr>
  );
}

export type SortDirection = "ASC" | "DESC";

export type SortState = { key: keyof RegionData; direction: SortDirection };

type SortableHeaderProps = {
  label: string;
  sortState: SortState;
  sortKey: keyof RegionData;
  toggleSortDirection: (
    sortKey: keyof RegionData,
    direction: SortDirection
  ) => void;
};

function SortableHeader(props: SortableHeaderProps) {
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

type EditableTableProps = {
  regionData: RegionData[];
  updateRow: (regionName: string, newValue: number) => void;
  onDeleteRow: (regionName: string, code: string) => void;
  toggleSortDirection: (
    sortKey: keyof RegionData,
    sortDirection: SortDirection
  ) => void;
  sortState: SortState;
};

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

export default function EditableTable(props: EditableTableProps) {
  function renderTableRows() {
    return props.regionData.map((data, index) => {
      return (
        <TableRow
          key={index}
          data={data}
          updateRow={props.updateRow}
          onDeleteRow={() => props.onDeleteRow(data.regionName, data.code)}
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
