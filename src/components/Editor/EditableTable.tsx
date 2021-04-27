import { useState } from "react";
import styled from "styled-components";
import { RegionData } from "./Editor";

type NumericInputProps = {
  value: number;
  onBlur: any; // TODO: function sig
};

function NumericInput(props: NumericInputProps) {
  const [value, setValue] = useState<number>();

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    if (newValue === undefined || parseFloat(newValue) === value) {
      return;
    }
    if (!/^[+-]?\d*(\.\d*)?$/.test(newValue)) {
      return;
    }
    setValue(parseFloat(newValue));
  }

  function handleOnBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseFloat(event.target.value) || 0;
    if (props.value === newValue) {
      return;
    }
    setValue(newValue);
    props.onBlur(newValue);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
}

type TableRowProps = {
  value: number;
  regionName: string;
  onDeleteRow: any; // TODO func sig
  onEditRow: (regionName: string, newVal: number) => void;
};

function TableRow(props: TableRowProps) {
  function handleInputBlur(newValue: number) {
    props.onEditRow(props.regionName, newValue);
  }
  return (
    <tr>
      <td>{props.regionName}</td>
      <td>
        <NumericInput value={props.value} onBlur={handleInputBlur} />
      </td>
      <td>
        <span className="remove-btn" onClick={props.onDeleteRow}>
          X
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
  onEditRow: (regionName: string, newValue: number) => void;
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

  input {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0;
    text-align: center;
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
          regionName={data.regionName}
          value={data.value}
          onEditRow={props.onEditRow}
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
