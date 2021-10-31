import React, { useState } from "react";
import config from "../../../../config";
import { AppNode } from "../../../../App";
import TextTableCell from "../cells/TextTableCell";
import {
  StyledCell,
  StyledColHeader,
  StyledColText,
  StyledDeleteCell,
  StyledHeaderWrapper,
  StyledRow,
  StyledSortIcon,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import NumericalTableCell from "../cells/NumericalTableCell";
import BooleanTableCell from "../cells/BooleanTableCell";
import { CellOption, SortDirection } from "../types";

type NodeTableSortState = { key: keyof AppNode; direction: SortDirection };

const defaultNodeSortState: NodeTableSortState = {
  key: "name",
  direction: "ASC",
};

export type NodeTableColumn = {
  text: string;
  key: keyof AppNode;
  width: number; // 0 to 1
  minWidthPx?: number;
  options?: CellOption[];
  onSelectOption?: (id: string, option: CellOption) => void;
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

export type NodeTableProps = {
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

  const sortIcon = !sortState
    ? ""
    : sortState.direction === "ASC"
    ? "\u25B2"
    : "\u25BC";

  function oppositeSortDirection(sortDirection: SortDirection): SortDirection {
    return sortDirection === "ASC" ? "DESC" : "ASC";
  }

  return (
    <StyledTableWrapper>
      <StyledTable>
        <StyledHeaderWrapper heightOffsetPx={config.tabHeightPx}>
          {nodeColumns.map((col) => {
            const isSortedCol = sortState && sortState.key === col.key;
            const onClick = () => {
              setSortState({
                key: col.key,
                direction:
                  !isSortedCol || !sortState
                    ? "ASC"
                    : oppositeSortDirection(sortState.direction),
              });
            };

            return (
              <StyledColHeader
                key={col.key.toString()}
                onClick={onClick}
                width={col.width}
                minWidth={col.minWidthPx}
              >
                <StyledColText>{col.text}</StyledColText>
                <StyledSortIcon>{isSortedCol ? sortIcon : ""}</StyledSortIcon>
              </StyledColHeader>
            );
          })}
          <StyledColHeader
            width={0.1}
            minWidth={40}
            style={{ cursor: "unset" }}
          />
        </StyledHeaderWrapper>
        <StyledTableBody>{tableRows}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
