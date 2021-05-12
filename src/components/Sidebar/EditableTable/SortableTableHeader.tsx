import React from "react";
import styled from "styled-components/macro";
import { Column } from "./EditableTable";
import config from "../../../config";

const StyledHeaderWrapper = styled.div`
  display: inline-flex;
  width: 100%;
  height: 100%;
  position: sticky;
  top: ${config.tabHeightPx}px;
`;

const StyledColHeader = styled.div<{ width: number; minWidth?: number }>`
  display: inline-flex;
  width: ${({ width }) => `${width * 100}%`};
  min-width: ${({ minWidth }) => (!!minWidth ? `${minWidth}px` : "none")};
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: 1px solid lightgrey;
  cursor: pointer;
  user-select: none;
  position: relative;
  background: white;
  border-bottom: 1px solid black;
`;

const StyledColText = styled.div`
  font-size: 0.8em;
  padding: 1em;
`;

const StyledSortIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
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
    ? "\u25B2"
    : "\u25BC";

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
            minWidth={col.minWidthPx}
          >
            <StyledColText>{col.text}</StyledColText>
            <StyledSortIcon>{isSortedCol ? sortIcon : ""}</StyledSortIcon>
          </StyledColHeader>
        );
      })}
      <StyledColHeader width={0.1} minWidth={40} />
    </StyledHeaderWrapper>
  );
}
