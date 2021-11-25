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
import { getNewConnectionKindsPossible } from "../../../../utils/nodeConnectionUtils";

export type AppConnectionTable = AppConnection & { isActive: boolean };
type ConnectionTableColumn = TableColumn<AppConnection>;

const defaultConnectionSortState: TableSortState<AppConnectionTable> = {
  key: "firstNodeId",
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
  connectionId: string,
  selectedfirstNodeId: string,
  selectedsecondNodeId: string,
  connections: AppConnection[]
): CellOption[] {
  const otherConnections = connections.filter(
    (conn) => !(conn.id !== connectionId)
  );

  if (colKey === "firstNodeId") {
    // options for firstNode node
    const noSelfConnectionOptions = options.filter(
      (option) => option.id !== selectedsecondNodeId
    );
    // for each firstNode option, there is no other connection that already matches the firstNode -> secondNode or secondNode -> firstNode
    return noSelfConnectionOptions.filter((option) => {
      return !otherConnections.some(
        (c) =>
          (c.firstNode.id === option.id &&
            c.secondNode.id === selectedsecondNodeId) ||
          (c.firstNode.id === selectedsecondNodeId &&
            c.secondNode.id === option.id)
      );
    });
  } else if (colKey === "secondNodeId") {
    // options for secondNode node
    const noSelfConnectionOptions = options.filter(
      (option) => option.id !== selectedfirstNodeId
    );
    // for each secondNode option, there is no other connection that already matches the firstNode -> secondNode or secondNode -> firstNode
    return noSelfConnectionOptions.filter((option) => {
      return !otherConnections.some(
        (c) =>
          (c.firstNode.id === selectedfirstNodeId &&
            c.secondNode.id === option.id) ||
          (c.firstNode.id === option.id &&
            c.secondNode.id === selectedfirstNodeId)
      );
    });
  } else if (colKey === "kind") {
    const selectedConnection = connections.find(
      (conn) => conn.id === connectionId
    );
    if (!!selectedConnection) {
      const possibleKinds = getNewConnectionKindsPossible(
        selectedConnection.kind,
        selectedConnection.firstNode,
        selectedConnection.secondNode,
        connections
      );
      return options.filter((opt) =>
        possibleKinds.includes(opt.id as HSConnectionKind)
      );
    } else {
      return options;
    }
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
    useSortableTable<AppConnectionTable>(
      defaultConnectionSortState,
      "secondNodeId",
      "kind"
    );

  const onSelectNewfirstNode = useCallback(
    (id: string, option: CellOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newfirstNodeNode = props.nodes.find(
        (node) => node.id === option.id
      );
      if (
        !connection ||
        !newfirstNodeNode ||
        newfirstNodeNode.id === connection.secondNode.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        firstNode: newfirstNodeNode,
        firstNodeId: newfirstNodeNode.id,
      });
    },
    [props]
  );

  const onSelectNewsecondNode = useCallback(
    (id: string, option: CellOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newsecondNodeNode = props.nodes.find(
        (node) => node.id === option.id
      );
      if (
        !connection ||
        !newsecondNodeNode ||
        newsecondNodeNode.id === connection.firstNode.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        secondNode: newsecondNodeNode,
        secondNodeId: newsecondNodeNode.id,
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
        key: "firstNodeId",
        width: 0.3,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewfirstNode,
      },
      {
        text: "Second Node",
        key: "secondNodeId",
        width: 0.3,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewsecondNode,
      },
      {
        text: "Resistance",
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
      onSelectNewfirstNode,
      onSelectNewsecondNode,
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
          activeNodeIds.includes(row.firstNode.id) ||
          activeNodeIds.includes(row.secondNode.id),
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
              afterValue={
                col.key !== "resistanceDegKPerW"
                  ? undefined
                  : row.kind === "rad"
                  ? " K^4/W"
                  : " K/W"
              }
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
                row.id,
                row.firstNode.id,
                row.secondNode.id,
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
