import config from "../../../config";
import {
  StyledColHeader,
  StyledColText,
  StyledHeaderWrapper,
  StyledSortIcon,
} from "./style";
import * as React from "react";
import { SortDirection, TableColumn, TableSortState } from "./types";

type TableHeaderProps<T> = {
  columns: TableColumn<T>[];
  sortState: TableSortState<T>;
  setSortState: React.Dispatch<React.SetStateAction<TableSortState<T>>>;
};

function oppositeSortDirection(sortDirection: SortDirection): SortDirection {
  return sortDirection === "ASC" ? "DESC" : "ASC";
}

export default function TableHeader<T>(
  props: TableHeaderProps<T>
): React.ReactElement {
  const { columns, sortState, setSortState } = props;

  const sortIcon = !sortState
    ? ""
    : sortState.direction === "ASC"
    ? "\u25B2"
    : "\u25BC";

  return (
    <StyledHeaderWrapper heightOffsetPx={config.tabHeightPx}>
      {columns.map((col) => {
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
            widthPercent={col.widthPercent}
            minWidthPx={col.minWidthPx}
          >
            <StyledColText>{col.text}</StyledColText>
            <StyledSortIcon>{isSortedCol ? sortIcon : ""}</StyledSortIcon>
          </StyledColHeader>
        );
      })}
      <StyledColHeader
        widthPercent={config.tableDeleteCellWidthPercent}
        minWidthPx={config.tableDeleteCellMinWidthPx}
        style={{ cursor: "unset" }}
      />
    </StyledHeaderWrapper>
  );
}
