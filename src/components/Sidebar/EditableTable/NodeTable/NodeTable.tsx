import React, { useMemo } from "react";
import config from "../../../../config";
import { AppNode } from "../../../../App";
import {
  StyledAddButton,
  StyledCell,
  StyledRow,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import { TableColumn, TableSortState } from "../types";
import TableHeader from "../TableHeader";
import TableCell from "../TableCell";
import useSortableTable from "../hooks/useSortableTable";
import DeleteCell from "../DeleteCell";
import { validateNodeName } from "../../../../utils/nodeConnectionUtils";
import { KELVIN } from "hotstuff-network";

type NodeTableColumn = TableColumn<AppNode>;

const defaultNodeSortState: TableSortState<AppNode> = {
  key: "name",
  direction: "ASC",
};

type NodeTableProps = {
  rows: AppNode[];
  onUpdateRow: (row: AppNode) => void;
  onDeleteRow: (row: AppNode) => void;
  onAddButton: () => void;
  setTemporaryError: (error: string) => void;
};

export default function NodeTable(props: NodeTableProps): React.ReactElement {
  const { rows, onUpdateRow, onDeleteRow, onAddButton, setTemporaryError } =
    props;

  const [sortState, setSortState, sortByState] = useSortableTable<AppNode>(
    defaultNodeSortState,
    "temperatureDegC",
    "capacitanceJPerDegK"
  );

  const nodeColumns: NodeTableColumn[] = useMemo(
    () => [
      {
        key: "name",
        text: "Name",
        width: 0.3,
        minWidthPx: 100,
        validator: (rowId: string, name: string) =>
          validateNodeName(
            name,
            rows.filter((r) => r.id !== rowId).map((r) => r.name)
          ),
      },
      {
        key: "temperatureDegC",
        text: "Temp [C]",
        width: 0.15,
        minWidthPx: 100,
        validator: (rowId, tempVal) => {
          if (parseFloat(tempVal) < -KELVIN) {
            setTemporaryError(
              "Temperature colder than what is physically possible"
            );
            return (-KELVIN).toString();
          }
          return tempVal;
        },
      },
      {
        key: "capacitanceJPerDegK",
        text: "Capacitance [J/K]",
        width: 0.15,
        minWidthPx: 100,
      },
      {
        key: "powerGenW",
        text: "Power Gen [W]",
        width: 0.15,
        minWidthPx: 80,
      },
      {
        key: "isBoundary",
        text: "Fixed Temp?",
        width: 0.15,
        minWidthPx: 80,
      },
    ],
    [rows, setTemporaryError]
  );

  const sortedRows = rows.sort(sortByState);

  const tableRows = sortedRows.map((row) => {
    return (
      <StyledRow
        key={row.id}
        heightOffsetPx={config.tabHeightPx}
        isActive={row.isActive}
      >
        {nodeColumns.map((col) => {
          const tableCell = (
            <TableCell<AppNode> row={row} col={col} onUpdateRow={onUpdateRow} />
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
        <DeleteCell row={row} onDeleteRow={() => onDeleteRow(row)} />
      </StyledRow>
    );
  });

  return (
    <StyledTableWrapper>
      <StyledTable>
        <TableHeader<AppNode>
          columns={nodeColumns}
          sortState={sortState}
          setSortState={setSortState}
        />
        <StyledTableBody>{tableRows}</StyledTableBody>
        <StyledAddButton onClick={onAddButton}>+</StyledAddButton>
      </StyledTable>
    </StyledTableWrapper>
  );
}
