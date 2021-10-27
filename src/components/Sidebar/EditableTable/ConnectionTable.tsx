import React, { useCallback, useMemo, useState } from "react";
import config from "../../../config";
import { AppConnection, AppNode } from "../../../App";
import EditableTable, { ColOption, Column } from "./EditableTable";
import { SortState } from "./SortableTableHeader";

type AppConnectionTable = AppConnection & { isActive: boolean };

const defaultConnectionSortState: SortState<AppConnectionTable> = {
  key: "source",
  direction: "ASC",
};

const connectionTypes: ColOption[] = [
  {
    id: "bi",
    text: "Bidirectional",
  },
  {
    id: "uni",
    text: "Unidirectional",
  },
  {
    id: "rad",
    text: "Radiative",
  },
];

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

  const nodeOptions: ColOption[] = props.nodes.map((node) => ({
    id: node.id,
    text: node.name,
  }));

  const onSelectNewSource = useCallback(
    (id: string, option: ColOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newSourceNode = props.nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newSourceNode ||
        newSourceNode.id === connection.target.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        source: newSourceNode,
        sourceName: newSourceNode.name,
      });
    },
    [props]
  );

  const onSelectNewTarget = useCallback(
    (id: string, option: ColOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newTargetNode = props.nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newTargetNode ||
        newTargetNode.id === connection.source.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        target: newTargetNode,
        targetName: newTargetNode.name,
      });
    },
    [props]
  );

  const connectionColumns: Column<AppConnection>[] = useMemo(
    () => [
      {
        text: "Source",
        key: "sourceName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewSource,
      },
      {
        text: "Target",
        key: "targetName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewTarget,
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
        options: connectionTypes,
        onSelectOption: (id: string, option: ColOption) =>
          props.onUpdateRow({
            ...props.rows.filter((conn) => conn.id === id)[0],
            kind: option.id as "bi" | "uni" | "rad",
          }),
      },
    ],
    [nodeOptions, onSelectNewSource, onSelectNewTarget, props]
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
