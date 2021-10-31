import React, { useCallback, useMemo } from "react";
import config from "../../../../config";
import { AppConnection, AppNode } from "../../../../App";
import {
  StyledCell,
  StyledDeleteCell,
  StyledRow,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import { CellOption, TableColumn, TableSortState } from "../types";
import TableHeader from "../TableHeader";
import TableCell from "../TableCell";
import useSortableTable from "../hooks/useSortableTable";

export type AppConnectionTable = AppConnection & { isActive: boolean };
type ConnectionTableColumn = TableColumn<AppConnection>;
type ConnectionType = "bi" | "uni" | "rad";

const defaultConnectionSortState: TableSortState<AppConnectionTable> = {
  key: "source",
  direction: "ASC",
};

const connectionTypes: CellOption[] = [
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

function filterConnectionOptions(
  colKey: string,
  options: CellOption[],
  selectedSourceId: string,
  selectedTargetId: string,
  connections: AppConnection[]
): CellOption[] {
  const otherConnections = connections.filter(
    (conn) =>
      !(
        conn.source.id === selectedSourceId &&
        conn.target.id === selectedTargetId
      )
  );

  if (colKey === "sourceName") {
    // options for source node
    const noSelfConnectionOptions = options.filter(
      (option) => option.id !== selectedTargetId
    );
    // for each source option, there is no other connection that already matches the source -> target or target -> source
    return noSelfConnectionOptions.filter((option) => {
      return !otherConnections.some(
        (c) =>
          (c.source.id === option.id && c.target.id === selectedTargetId) ||
          (c.source.id === selectedTargetId && c.target.id === option.id)
      );
    });
  } else if (colKey === "targetName") {
    // options for target node
    const noSelfConnectionOptions = options.filter(
      (option) => option.id !== selectedSourceId
    );
    // for each target option, there is no other connection that already matches the source -> target or target -> source
    return noSelfConnectionOptions.filter((option) => {
      return !otherConnections.some(
        (c) =>
          (c.source.id === selectedSourceId && c.target.id === option.id) ||
          (c.source.id === option.id && c.target.id === selectedSourceId)
      );
    });
  } else {
    return options;
  }
}

type ConnectionTableProps = {
  rows: AppConnection[];
  nodes: AppNode[];
  onUpdateRow: (row: AppConnection) => void;
  onDeleteRow: (row: AppConnection) => void;
};

export default function ConnectionTable(
  props: ConnectionTableProps
): React.ReactElement {
  const [sortState, setSortState, sortByState] =
    useSortableTable<AppConnectionTable>({
      default: defaultConnectionSortState,
    });

  const onSelectNewSource = useCallback(
    (id: string, option: CellOption) => {
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
    (id: string, option: CellOption) => {
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

  const onSelectNewConnectionType = useCallback(
    (id: string, option: CellOption) => {
      const rowToUpdate = props.rows.find((conn) => conn.id === id);
      if (rowToUpdate) {
        props.onUpdateRow({
          ...rowToUpdate,
          kind: option.id as ConnectionType,
        });
      }
    },
    [props]
  );

  const nodeOptions: CellOption[] = props.nodes.map((node) => ({
    id: node.id,
    text: node.name,
  }));

  const connectionColumns: ConnectionTableColumn[] = useMemo(
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
        onSelectOption: onSelectNewConnectionType,
      },
    ],
    [
      nodeOptions,
      onSelectNewConnectionType,
      onSelectNewSource,
      onSelectNewTarget,
    ]
  );

  const activeNodeIds = props.nodes
    .filter((node) => node.isActive)
    .map((node) => node.id);

  const sortedRowsWithIsActive: AppConnectionTable[] = props.rows
    .map((row) => {
      return {
        ...row,
        isActive:
          activeNodeIds.includes(row.source.id) ||
          activeNodeIds.includes(row.target.id),
      };
    })
    .sort(sortByState);

  const tableRows = sortedRowsWithIsActive.map((row) => {
    return (
      <StyledRow
        key={row.id}
        heightOffsetPx={config.tabHeightPx}
        isActive={row.isActive}
      >
        {connectionColumns.map((col) => {
          const tableCell = (
            <TableCell<AppConnectionTable>
              row={row}
              col={col}
              options={filterConnectionOptions(
                col.key,
                col.options || [],
                row.source.id,
                row.target.id,
                props.rows
              )}
              initiallySetOption={col.options?.find(
                (option) =>
                  option.id === row[col.key] || option.text === row[col.key]
              )}
              onUpdateRow={props.onUpdateRow}
            />
          );
          return (
            <StyledCell
              key={col.key}
              width={col.width}
              minWidth={col.minWidthPx}
            >
              {tableCell}
            </StyledCell>
          );
        })}
        <StyledDeleteCell
          width={config.tableDeleteCellWidthPerc}
          minWidth={config.tableDeleteCellMinWidthPx}
          onClick={() => props.onDeleteRow(row)}
        >
          ❌
        </StyledDeleteCell>
      </StyledRow>
    );
  });

  return (
    <StyledTableWrapper>
      <StyledTable>
        <TableHeader<AppConnectionTable>
          columns={connectionColumns}
          sortState={sortState}
          setSortState={setSortState}
        />
        <StyledTableBody>{tableRows}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
