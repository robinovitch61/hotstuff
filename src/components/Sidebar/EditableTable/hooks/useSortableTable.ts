import { useState } from "react";
import { TableSortState } from "../types";

export default function useSortableTable<T>(props: {
  default: TableSortState<T>;
}): [
  TableSortState<T>,
  React.Dispatch<React.SetStateAction<TableSortState<T>>>,
  (first: T, second: T) => number
] {
  const [sortState, setSortState] = useState<TableSortState<T>>(props.default);

  function sortByState(first: T, second: T): number {
    if (first[sortState.key] > second[sortState.key]) {
      return sortState.direction === "ASC" ? 1 : -1;
    } else {
      return sortState.direction === "ASC" ? -1 : 1;
    }
  }

  return [sortState, setSortState, sortByState];
}
