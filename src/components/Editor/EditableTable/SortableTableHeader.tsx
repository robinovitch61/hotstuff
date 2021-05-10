import React from "react";
import styled from "styled-components/macro";
import { Column } from "./EditableTable";

const StyledHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
`;

const StyledColHeader = styled.div<{ width: number }>`
  border: 1px solid lightgrey;
  cursor: pointer;
  width: ${({ width }) => `${width * 100}%`};
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  user-select: none;
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
          >
            {`${col.text} ${isSortedCol ? sortIcon : ""}`}
          </StyledColHeader>
        );
      })}
      <StyledColHeader width={0.1}></StyledColHeader>
    </StyledHeaderWrapper>
  );
}
