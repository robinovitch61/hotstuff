import * as React from "react";
import { useState } from "react";
import { TableSortState } from "../types";

export default function useSortableTable<T>(
  defaultSortState: TableSortState<T>,
  tieBreakerKey: keyof T,
  ultraSuperDuperTieBreakerKey: keyof T
): [
  TableSortState<T>,
  React.Dispatch<React.SetStateAction<TableSortState<T>>>,
  (first: T, second: T) => number
] {
  const [sortState, setSortState] =
    useState<TableSortState<T>>(defaultSortState);

  function sortByState(first: T, second: T): number {
    if (sortState.direction === "ASC") {
      if (first[sortState.key] > second[sortState.key]) {
        return 1;
      } else if (first[sortState.key] === second[sortState.key]) {
        if (first[tieBreakerKey] > second[tieBreakerKey]) {
          return 1;
        } else if (first[tieBreakerKey] === second[tieBreakerKey]) {
          return first[ultraSuperDuperTieBreakerKey] >
            second[ultraSuperDuperTieBreakerKey]
            ? 1
            : -1;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    } else {
      if (first[sortState.key] > second[sortState.key]) {
        return -1;
      } else if (first[sortState.key] === second[sortState.key]) {
        return first[tieBreakerKey] > second[tieBreakerKey] ? 1 : -1;
      } else {
        return 1;
      }
    }
  }

  return [sortState, setSortState, sortByState];
}
