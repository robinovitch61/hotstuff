import * as React from "react";
import { useState } from "react";
import { TableSortState } from "../types";

interface IDHavingThing {
  id: string;
}

export default function useSortableTable<T extends IDHavingThing>(props: {
  default: TableSortState<T>;
}): [
  TableSortState<T>,
  React.Dispatch<React.SetStateAction<TableSortState<T>>>,
  (first: T, second: T) => number
] {
  const [sortState, setSortState] = useState<TableSortState<T>>(props.default);

  function sortByState(first: T, second: T): number {
    if (sortState.direction === "ASC") {
      if (first[sortState.key] > second[sortState.key]) {
        return 1;
      } else if (first[sortState.key] === second[sortState.key]) {
        return first.id > second.id ? 1 : -1;
      } else {
        return -1;
      }
    } else {
      if (first[sortState.key] > second[sortState.key]) {
        return -1;
      } else if (first[sortState.key] === second[sortState.key]) {
        return first.id > second.id ? 1 : -1;
      } else {
        return 1;
      }
    }
  }

  return [sortState, setSortState, sortByState];
}
