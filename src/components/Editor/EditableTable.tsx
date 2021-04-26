import { useState } from "react";

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
        <span
          className="glyphicon glyphicon-remove remove-btn"
          onClick={props.onDeleteRow}
        />
      </td>
    </tr>
  );
}

type SortState = { key: string; direction: "ASC" | "DESC" };

type SortableHeaderProps = {
  label: string;
  sortState: SortState;
  sortKey: string;
  toggleSortDirection: any; // TODO func sig
};

function SortableHeader(props: SortableHeaderProps) {
  function renderSortArrow() {
    if (props.sortState.key !== props.sortKey) return;
    const glyphClass =
      props.sortState.direction === "ASC"
        ? "glyphicon glyphicon-chevron-down"
        : "glyphicon glyphicon-chevron-up";

    return <span className={glyphClass} aria-hidden="true"></span>;
  }
  return (
    <th onClick={() => props.toggleSortDirection(props.sortKey)}>
      <h4>{props.label}</h4>
      {renderSortArrow()}
    </th>
  );
}

type RegionData = {
  regionName: string;
  value: number;
  code: string;
};

type EditableTableProps = {
  regionData: RegionData[];
  onEditRow: (regionName: string, newValue: number) => void;
  onDeleteRow: (regionName: string, code: string) => void;
  toggleSortDirection: (sortKey: any) => void;
  sortState: SortState;
};

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
    <table>
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
    </table>
  );
}
