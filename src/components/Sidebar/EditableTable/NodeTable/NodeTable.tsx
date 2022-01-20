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
import noteValidator from "../tableUtils";

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
  onClickEditableCell: (rowId: string) => void;
  setTemporaryErrors: (error: string[]) => void;
};

export default function NodeTable(props: NodeTableProps): React.ReactElement {
  const {
    rows,
    onUpdateRow,
    onDeleteRow,
    onAddButton,
    onClickEditableCell,
    setTemporaryErrors,
  } = props;

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
        minWidthPx: 150,
        validator: (rowId: string, name: string) =>
          validateNodeName(
            name,
            rows.filter((r) => r.id !== rowId).map((r) => r.name)
          ),
      },
      {
        key: "temperatureDegC",
        text: "Temp [C]",
        minWidthPx: 120,
        validator: (rowId, tempVal) => {
          if (parseFloat(tempVal) < -KELVIN) {
            setTemporaryErrors([
              "Temperature colder than what is physically possible",
            ]);
            return (-KELVIN).toString();
          }
          return tempVal;
        },
      },
      {
        key: "capacitanceJPerDegK",
        text: "Capacitance [J/K]",
        minWidthPx: 120,
      },
      {
        key: "powerGenW",
        text: "Power Gen [W]",
        minWidthPx: 120,
      },
      {
        key: "isBoundary",
        text: "Fixed Temp?",
        minWidthPx: 100,
      },
      {
        key: "nodeNotes",
        text: "Notes",
        widthPercent: 1,
        minWidthPx: 100,
        validator: (rowId, value) =>
          noteValidator(rowId, value, setTemporaryErrors),
      },
    ],
    [rows, setTemporaryErrors]
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
              width={col.widthPercent}
              minWidth={col.minWidthPx}
              onFocus={() => onClickEditableCell(row.id)} // onFocus so as not to interfere with child onClicks
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
