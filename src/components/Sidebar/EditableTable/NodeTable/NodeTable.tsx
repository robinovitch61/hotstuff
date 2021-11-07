import React from "react";
import config from "../../../../config";
import { AppNode } from "../../../../App";
import {
  StyledCell,
  StyledDeleteCell,
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

type NodeTableColumn = TableColumn<AppNode>;

const defaultNodeSortState: TableSortState<AppNode> = {
  key: "name",
  direction: "ASC",
};

const nodeColumns: NodeTableColumn[] = [
  {
    key: "name",
    text: "Name",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    key: "temperatureDegC",
    text: "Temp degC",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    key: "capacitanceJPerDegK",
    text: "Capacitance J/degK",
    width: 0.2,
    minWidthPx: 100,
  },
  {
    key: "powerGenW",
    text: "Power Gen W",
    width: 0.15,
    minWidthPx: 80,
  },
  {
    key: "isBoundary",
    text: "Boundary?",
    width: 0.15,
    minWidthPx: 80,
  },
];

type NodeTableProps = {
  rows: AppNode[];
  onUpdateRow: (row: AppNode) => void;
  onDeleteRow: (row: AppNode) => void;
};

export default function NodeTable(props: NodeTableProps): React.ReactElement {
  const [sortState, setSortState, sortByState] = useSortableTable<AppNode>({
    default: defaultNodeSortState,
  });

  const { rows, onUpdateRow, onDeleteRow } = props;

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
      </StyledTable>
    </StyledTableWrapper>
  );
}
