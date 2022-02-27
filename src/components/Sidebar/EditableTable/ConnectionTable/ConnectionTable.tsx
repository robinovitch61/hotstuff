import React, { useCallback, useMemo } from "react";
import config from "../../../../config";
import { AppConnection, AppNode } from "../../../../App";
import {
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
import {
  filterConnectionOptions,
  getConnectionAfterValue,
} from "../../../../utils/nodeConnectionUtils";
import noteValidator from "../tableUtils";
import ConnectionKindOption from "./ConnectionKindOption";

export type AppConnectionTable = AppConnection & { isActive: boolean };
export type ConnectionTableColumn = TableColumn<AppConnectionTable>;

const defaultConnectionSortState: TableSortState<AppConnectionTable> = {
  key: "firstNodeId",
  direction: "ASC",
};

const connectionKindOptions: CellOption[] = [
  {
    id: "cond",
    text: "Conduction",
  },
  {
    id: "conv",
    text: "Convection️️",
  },
  {
    id: "rad",
    text: "Radiation️",
  },
];

type ConnectionTableProps = {
  rows: AppConnection[];
  nodes: AppNode[];
  onUpdateRow: (row: AppConnection) => void;
  onDeleteRow: (row: AppConnection) => void;
  setTemporaryErrors: (error: string[]) => void;
};

export default function ConnectionTable(
  props: ConnectionTableProps
): React.ReactElement {
  const { rows, nodes, onUpdateRow, onDeleteRow, setTemporaryErrors } = props;

  const [sortState, setSortState, sortByState] =
    useSortableTable<AppConnectionTable>(
      defaultConnectionSortState,
      "secondNodeId",
      "kind"
    );

  const onSelectNewFirstNode = useCallback(
    (id: string, option: CellOption) => {
      const connection = rows.find((conn) => conn.id === id);
      const newFirstNodeNode = nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newFirstNodeNode ||
        newFirstNodeNode.id === connection.secondNode.id
      ) {
        return;
      }
      onUpdateRow({
        ...connection,
        firstNode: newFirstNodeNode,
        firstNodeId: newFirstNodeNode.id,
      });
    },
    [nodes, onUpdateRow, rows]
  );

  const onSelectNewSecondNode = useCallback(
    (id: string, option: CellOption) => {
      const connection = rows.find((conn) => conn.id === id);
      const newSecondNodeNode = nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newSecondNodeNode ||
        newSecondNodeNode.id === connection.firstNode.id
      ) {
        return;
      }
      onUpdateRow({
        ...connection,
        secondNode: newSecondNodeNode,
        secondNodeId: newSecondNodeNode.id,
      });
    },
    [nodes, onUpdateRow, rows]
  );

  const onSelectNewConnectionType = useCallback(
    (id: string, option: CellOption) => {
      const rowToUpdate = rows.find((conn) => conn.id === id);
      if (rowToUpdate) {
        onUpdateRow({
          ...rowToUpdate,
          kind: option.id as HSConnectionKind,
        });
      }
    },
    [onUpdateRow, rows]
  );

  const nodeOptions: CellOption[] = nodes.map((node) => ({
    id: node.id,
    text: node.name,
  }));

  const connectionColumns: ConnectionTableColumn[] = useMemo(
    () => [
      {
        key: "firstNodeId",
        text: "First Node",
        minWidthPx: 120,
        options: nodeOptions,
        onSelectOption: onSelectNewFirstNode,
      },
      {
        key: "secondNodeId",
        text: "Second Node",
        minWidthPx: 120,
        options: nodeOptions,
        onSelectOption: onSelectNewSecondNode,
      },
      {
        key: "resistanceDegKPerW",
        text: "Resistance",
        minWidthPx: 120,
        validator: (rowId, resistance) => {
          const resistanceNumber = parseFloat(resistance);
          if (resistanceNumber <= 0) {
            if (resistanceNumber === 0) {
              setTemporaryErrors(["Resistance cannot be zero"]);
            } else {
              setTemporaryErrors(["Resistance cannot be negative"]);
            }
            return config.defaultSmallResistanceDegKPerW.toString();
          }
          return resistance;
        },
      },
      {
        key: "kind",
        text: "Kind",
        minWidthPx: 120,
        options: connectionKindOptions.map((option) => ({
          ...option,
          text: ConnectionKindOption({ option }),
        })),
        onSelectOption: onSelectNewConnectionType,
      },
      {
        key: "connectionNotes",
        text: "Notes",
        widthPercent: 1,
        minWidthPx: 100,
        validator: (rowId, value) =>
          noteValidator(rowId, value, setTemporaryErrors),
      },
    ],
    [
      nodeOptions,
      onSelectNewConnectionType,
      onSelectNewFirstNode,
      onSelectNewSecondNode,
      setTemporaryErrors,
    ]
  );

  const activeNodeIds = nodes
    .filter((node) => node.isActive)
    .map((node) => node.id);

  const sortedRowsWithActiveInfo: AppConnectionTable[] = rows
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
          <StyledCell
            key={col.key}
            width={col.widthPercent}
            minWidth={col.minWidthPx}
          >
            <TableCell<AppConnectionTable>
              row={row}
              col={col}
              options={options}
              initiallySetOption={setOption}
              onUpdateRow={onUpdateRow}
              afterValue={getConnectionAfterValue(col, row)}
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
                row,
                rows
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
        <DeleteCell row={row} onDeleteRow={() => onDeleteRow(row)} />
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
