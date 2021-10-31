import React, { useState } from "react";
import config from "../../../../config";
import { AppNode } from "../../../../App";
import TextTableCell from "../cells/TextTableCell";
import {
  StyledCell,
  StyledDeleteCell,
  StyledRow,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import NumericalTableCell from "../cells/NumericalTableCell";
import BooleanTableCell from "../cells/BooleanTableCell";
import { TableColumn, TableSortState } from "../types";
import TableHeader from "../TableHeader";

type NodeTableSortState = TableSortState<AppNode>;
type NodeTableColumn = TableColumn<AppNode>;

const defaultNodeSortState: NodeTableSortState = {
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
  const [sortState, setSortState] =
    useState<NodeTableSortState>(defaultNodeSortState);

  function sortByState(first: AppNode, second: AppNode): number {
    if (first[sortState.key] > second[sortState.key]) {
      return sortState.direction === "ASC" ? 1 : -1;
    } else {
      return sortState.direction === "ASC" ? -1 : 1;
    }
  }

  const sortedRows = props.rows.sort(sortByState);

  const tableRows = sortedRows.map((row) => {
    return (
      <StyledRow
        key={row.id}
        heightOffsetPx={config.tabHeightPx}
        isActive={row.isActive}
      >
        {nodeColumns.map((col) => {
          const initialVal = row[col.key];
          const tableCell =
            typeof initialVal === "string" ? (
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
