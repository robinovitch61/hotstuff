import React, { useCallback, useMemo, useState } from "react";
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
import DropDownTableCell from "../cells/DropDownTableCell";
import TextTableCell from "../cells/TextTableCell";
import NumericalTableCell from "../cells/NumericalTableCell";
import BooleanTableCell from "../cells/BooleanTableCell";
import { CellOption, TableColumn, TableSortState } from "../types";
import TableHeader from "../TableHeader";

type AppConnectionTable = AppConnection & { isActive: boolean };
type ConnectionTableSortState = TableSortState<AppConnectionTable>;
type ConnectionTableColumn = TableColumn<AppConnection>;
type ConnectionType = "bi" | "uni" | "rad";

const defaultConnectionSortState: ConnectionTableSortState = {
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
  const [sortState, setSortState] = useState<ConnectionTableSortState>(
    defaultConnectionSortState
  );

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
          const initialVal = row[col.key];
          const tableCell =
            !!col.options && col.options.length > 0 && col.onSelectOption ? (
              <DropDownTableCell
                rowId={row.id}
                options={filterConnectionOptions(
                  col.key,
                  col.options,
                  row.source.id,
                  row.target.id,
                  props.rows
                )}
                setOption={col.options.find(
                  (option) =>
                    option.id === row[col.key] || option.text === row[col.key]
                )}
                onSelectOption={col.onSelectOption}
              />
            ) : typeof initialVal === "string" ? (
              <TextTableCell
                initialVal={initialVal}
                onBlur={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
              />
            ) : typeof initialVal === "number" &&
              typeof row[col.key] === "number" ? (
              <NumericalTableCell
                initialVal={initialVal}
                onBlur={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
              />
            ) : typeof initialVal === "boolean" ? (
              <BooleanTableCell
                initialIsActive={initialVal}
                onClick={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
                showWhenActive={"✅"}
              />
            ) : (
              <></>
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
          width={0.1}
          minWidth={40}
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
