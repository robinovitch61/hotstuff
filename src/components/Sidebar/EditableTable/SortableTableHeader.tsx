import * as React from "react";
import { Column } from "./EditableTable";
import {
  StyledColHeader,
  StyledColText,
  StyledHeaderWrapper,
  StyledSortIcon,
} from "./style";

function oppositeSortDirection(sortDirection: SortDirection): SortDirection {
  return sortDirection === "ASC" ? "DESC" : "ASC";
}

export type SortDirection = "ASC" | "DESC";
export type SortState<T> = { key: keyof T; direction: SortDirection };

export type SortableHeaderProps<T> = {
  columns: Column<T>[];
  sortState?: SortState<T>;
  updateSortState: (sortState: SortState<T>) => void;
  heightOffsetPx?: number;
};

export default function SortableHeader<T>(
  props: SortableHeaderProps<T>
): React.ReactElement {
  const sortIcon = !props.sortState
    ? ""
    : props.sortState.direction === "ASC"
    ? "\u25B2"
    : "\u25BC";

  return (
    <StyledHeaderWrapper heightOffsetPx={props.heightOffsetPx}>
      {props.columns.map((col) => {
        const isSortedCol = props.sortState && props.sortState.key === col.key;
        const onClick = () => {
          props.updateSortState({
            key: col.key,
            direction:
              !isSortedCol || !props.sortState
                ? "ASC"
                : oppositeSortDirection(props.sortState.direction),
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
      <StyledColHeader width={0.1} minWidth={40} style={{ cursor: "unset" }} />
    </StyledHeaderWrapper>
  );
}
