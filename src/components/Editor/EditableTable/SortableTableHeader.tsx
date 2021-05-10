import React from "react";
import styled from "styled-components/macro";
import { Column } from "./EditableTable";

const StyledHeaderWrapper = styled.thead``;

const StyledRow = styled.tr``;

const StyledColHeader = styled.th`
  border: 1px solid lightgrey;
  cursor: pointer;
`;

function oppositeSortDirection(sortDirection: SortDirection): SortDirection {
  return sortDirection === "ASC" ? "DESC" : "ASC";
}

export type SortDirection = "ASC" | "DESC";
export type SortState<T> = { key: keyof T; direction: SortDirection };

export type SortableHeaderProps<T> = {
  columns: Column<T>[];
  sortState?: SortState<T>;
  updateSortState: (sortState: SortState<T>) => void;
};

export default function SortableHeader<T>(
  props: SortableHeaderProps<T>
): React.ReactElement {
  const sortIcon = !props.sortState
    ? ""
    : props.sortState.direction === "ASC"
    ? "🔼"
    : "🔽";

  return (
    <StyledHeaderWrapper>
      <StyledRow>
        {props.columns.map((col) => {
          const isSortedCol =
            props.sortState && props.sortState.key === col.key;
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
            <StyledColHeader key={col.key.toString()} onClick={onClick}>
              {`${col.text} ${isSortedCol ? sortIcon : ""}`}
            </StyledColHeader>
          );
        })}
      </StyledRow>
    </StyledHeaderWrapper>
  );
}
