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
  },
  {
    text: "Temp [degC]",
    key: "temperatureDegC",
    width: 0.1,
  },
  {
    text: "Capacitance [J/degK]",
    key: "capacitanceJPerDegK",
    width: 0.1,
  },
  {
    text: "Power Gen [W]",
    key: "powerGenW",
    width: 0.1,
  },
  {
    text: "Is Boundary?",
    key: "isBoundary",
    width: 0.1,
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

  return (
    <EditableTable<AppNode>
      columns={nodeColumns}
      rowData={props.rows}
      onUpdateRow={props.onUpdateRow}
      onDeleteRow={props.onDeleteRow}
      onUpdateSortState={(newSortState: SortState<AppNode>) =>
        setSortState(newSortState)
      }
      sortState={sortState}
    />
  );
}
