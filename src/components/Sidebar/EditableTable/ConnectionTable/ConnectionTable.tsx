import React, { useCallback, useMemo } from "react";
import config from "../../../../config";
import { AppConnection, AppNode } from "../../../../App";
import {
  StyledAddButton,
  StyledCell,
  StyledRow,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import { CellOption, TableColumn, TableSortState } from "../types";
import TableHeader from "../TableHeader";
import TableCell from "../TableCell";
import useSortableTable from "../hooks/useSortableTable";
import DeleteCell from "../DeleteCell";
import { HSConnectionKind } from "hotstuff-network";

export type AppConnectionTable = AppConnection & { isActive: boolean };
type ConnectionTableColumn = TableColumn<AppConnection>;

const defaultConnectionSortState: TableSortState<AppConnectionTable> = {
  key: "sourceId",
  direction: "ASC",
};

const connectionTypes: CellOption[] = [
  {
    id: "cond",
    text: "🔗 Conduction",
  },
  {
    id: "conv",
    text: "♨️ Convection️️",
  },
  {
    id: "rad",
    text: "☀️ Radiation️",
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

  if (colKey === "sourceId") {
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
  } else if (colKey === "targetId") {
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
  } else if (colKey === "kind") {
    // if there's another connection between the nodes (either direction) with that same kind:
    // - no option for the same kind of connection
    // - no option for both conduction and convection at once as this doesn't make sense physically (solid vs. fluid)
    return options;
  } else {
    return options;
  }
}

type ConnectionTableProps = {
  rows: AppConnection[];
  nodes: AppNode[];
  onUpdateRow: (row: AppConnection) => void;
  onDeleteRow: (row: AppConnection) => void;
  onAddButton: () => void;
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
        sourceId: newSourceNode.id,
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
        targetId: newTargetNode.id,
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
          kind: option.id as HSConnectionKind,
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
        text: "First Node",
        key: "sourceId",
        width: 0.3,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewSource,
      },
      {
        text: "Second Node",
        key: "targetId",
        width: 0.3,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewTarget,
      },
      {
        text: "Resistance [degK/W]",
        key: "resistanceDegKPerW",
        width: 0.2,
        minWidthPx: 100,
      },
      {
        text: "Kind",
        key: "kind",
        width: 0.2,
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

  const sortedRowsWithActiveInfo: AppConnectionTable[] = props.rows
    .map((row) => {
      return {
        ...row,
        isActive:
          activeNodeIds.includes(row.source.id) ||
          activeNodeIds.includes(row.target.id),
      };
    })
    .sort(sortByState);

  const tableRows = sortedRowsWithActiveInfo.map((row) => {
    const cols = connectionColumns.map((col) => {
      function makeStyledCell(
        options: CellOption[],
        setOption: CellOption | undefined
      ) {
        return (
          <StyledCell key={col.key} width={col.width} minWidth={col.minWidthPx}>
            <TableCell<AppConnectionTable>
              row={row}
              col={col}
              options={options}
              initiallySetOption={setOption}
              onUpdateRow={props.onUpdateRow}
            />
          </StyledCell>
        );
      }

      if (!!col.options) {
        const setOption = col.options.find(
          (option) => option.id === row[col.key]
        );

        const options = !setOption
          ? []
          : [
              setOption,
              ...filterConnectionOptions(
                col.key,
                col.options || [],
                row.source.id,
                row.target.id,
                props.rows
              ).filter((opt) => opt.id !== setOption.id),
            ];

        return makeStyledCell(options, setOption);
      } else {
        return makeStyledCell([], undefined);
      }
    });

    return (
      <StyledRow
        key={row.id}
        heightOffsetPx={config.tabHeightPx}
        isActive={row.isActive}
      >
        {cols}
        <DeleteCell row={row} onDeleteRow={() => props.onDeleteRow(row)} />
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
        <StyledAddButton onClick={props.onAddButton}>+</StyledAddButton>
      </StyledTable>
    </StyledTableWrapper>
  );
}
