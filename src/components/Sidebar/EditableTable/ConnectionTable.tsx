import React, { useMemo, useState } from "react";
import config from "../../../config";
import { AppConnection, AppNode } from "../../../App";
import EditableTable, { ColOption, Column } from "./EditableTable";
import { SortState } from "./SortableTableHeader";

type AppConnectionTable = AppConnection & { isActive: boolean };

const defaultConnectionSortState: SortState<AppConnectionTable> = {
  key: "source",
  direction: "ASC",
};

export type ConnectionTableProps = {
  rows: AppConnection[];
  nodes: AppNode[];
  onUpdateRow: (row: AppConnection) => void;
  onDeleteRow: (row: AppConnection) => void;
};

export default function ConnectionTable(
  props: ConnectionTableProps
): React.ReactElement {
  const [sortState, setSortState] = useState<SortState<AppConnectionTable>>(
    defaultConnectionSortState
  );

  const nodeOptions = props.nodes.map((node) => ({
    text: node.name,
    value: node.id,
  }));

  const connectionColumns: Column<AppConnection>[] = useMemo(
    () => [
      {
        text: "Source",
        key: "sourceName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: (id: string, option: ColOption) => {
          const connection = props.rows.filter((conn) => conn.id === id)[0];
          const newSourceNode = props.nodes.filter(
            (node) => node.id == option.value
          )[0];
          if (newSourceNode.id !== connection.target.id) {
            props.onUpdateRow({
              ...connection,
              source: newSourceNode,
              sourceName: newSourceNode.name,
            });
          }
        },
      },
      {
        text: "Target",
        key: "targetName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: (id: string, option: ColOption) => {
          const connection = props.rows.filter((conn) => conn.id === id)[0];
          const newTargetNode = props.nodes.filter(
            (node) => node.id == option.value
          )[0];
          if (newTargetNode.id !== connection.source.id) {
            props.onUpdateRow({
              ...connection,
              target: newTargetNode,
              targetName: newTargetNode.name,
            });
          }
        },
      },
      {
        text: "Resistance degK/W",
        key: "resistanceDegKPerW",
        width: 0.25,
        minWidthPx: 100,
      },
      {
        text: "Kind",
        key: "kind",
        width: 0.25,
        minWidthPx: 100,
        options: [
          {
            text: "Bidirectional",
            value: "bi",
          },
          {
            text: "Unidirectional",
            value: "uni",
          },
          {
            text: "Radiative",
            value: "rad",
          },
        ],
        onSelectOption: (id: string, option: ColOption) =>
          props.onUpdateRow({
            ...props.rows.filter((conn) => conn.id === id)[0],
            kind: option.value as "bi" | "uni" | "rad",
          }),
      },
    ],
    [nodeOptions, props]
  );

  function sortByState(
    first: AppConnectionTable,
    second: AppConnectionTable
  ): number {
    if (first[sortState.key] > second[sortState.key]) {
      return sortState.direction === "ASC" ? 1 : -1;
    } else {
      return sortState.direction === "ASC" ? -1 : 1;
    }
  }

  const activeNodeIds = props.nodes
    .filter((node) => node.isActive)
    .map((node) => node.id);

  const rowData: AppConnectionTable[] = props.rows
    .map((row) => {
      return {
        ...row,
        isActive:
          activeNodeIds.includes(row.source.id) ||
          activeNodeIds.includes(row.target.id),
      };
    })
    .sort(sortByState);

  return (
    <EditableTable<AppConnectionTable>
      columns={connectionColumns}
      rowData={rowData}
      onUpdateRow={props.onUpdateRow}
      onDeleteRow={props.onDeleteRow}
      onUpdateSortState={(newSortState: SortState<AppConnectionTable>) =>
        setSortState(newSortState)
      }
      sortState={sortState}
      heightOffsetPx={config.tabHeightPx}
    />
  );
}
