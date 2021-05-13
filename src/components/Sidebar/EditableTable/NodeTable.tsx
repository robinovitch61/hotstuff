import React, { useState } from "react";
import { AppNode } from "../../App";
import EditableTable, { Column } from "./EditableTable";
import { SortState } from "./SortableTableHeader";

const defaultNodeSortState: SortState<AppNode> = {
  key: "name",
  direction: "ASC",
};

const nodeColumns: Column<AppNode>[] = [
  {
    text: "Name",
    key: "name",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    text: "Temp degC",
    key: "temperatureDegC",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    text: "Capacitance J/degK",
    key: "capacitanceJPerDegK",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    text: "Power Gen W",
    key: "powerGenW",
    width: 0.15,
    minWidthPx: 80,
  },
  {
    text: "Boundary?",
    key: "isBoundary",
    width: 0.15,
    minWidthPx: 80,
  },
];

export type NodeTableProps = {
  rows: AppNode[];
  onUpdateRow: (row: AppNode) => void;
  onDeleteRow: (row: AppNode) => void;
};

export default function NodeTable(props: NodeTableProps): React.ReactElement {
  const [sortState, setSortState] = useState<SortState<AppNode>>(
    defaultNodeSortState
  );

  function sortByState(first: AppNode, second: AppNode): number {
    if (first[sortState.key] > second[sortState.key]) {
      return sortState.direction === "ASC" ? 1 : -1;
    } else {
      return sortState.direction === "ASC" ? -1 : 1;
    }
  }

  return (
    <EditableTable<AppNode>
      columns={nodeColumns}
      rowData={[...props.rows].sort(sortByState)}
      onUpdateRow={props.onUpdateRow}
      onDeleteRow={props.onDeleteRow}
      onUpdateSortState={(newSortState: SortState<AppNode>) =>
        setSortState(newSortState)
      }
      sortState={sortState}
    />
  );
}
