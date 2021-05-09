import React from "react";
import EditableTable, { SortState } from "./EditableTable";

export type NodeRow = {
  id: string;
  name: string;
  temperatureDegC: number;
  capacitanceJPerDegK: number;
  powerGenW: number;
  isBoundary: boolean;
};

const defaultNodeSortState: SortState<NodeRow> = {
  key: "name",
  direction: "ASC",
};

export type NodeTableProps = {
  rows: NodeRow[];
  onUpdateRow: () => void;
  onDeleteRow: (id: string) => void;
};

export default function NodeTable(props: NodeTableProps) {
  return (
    <EditableTable<NodeRow>
      columns={[
        "Name",
        "Initial Temp [degC]",
        "Capacitance [J/degK]",
        "Power Gen [W]",
        "Boundary?",
      ]}
      data={props.rows}
      onUpdateRow={props.onUpdateRow}
      onDeleteRow={props.onDeleteRow}
      sortState={defaultNodeSortState}
    />
  );
}
