import * as React from "react";

export type CellOption = {
  id: string;
  text: string | React.ReactElement;
};

export type SortDirection = "ASC" | "DESC";

export type TableColumn<T> = {
  text: string;
  key: keyof T;
  widthPercent?: number; // 0 to 1
  minWidthPx?: number;
  options?: CellOption[];
  onSelectOption?: (id: string, option: CellOption) => void;
  validator?: (rowId: string, val: string) => string;
};

export type TableSortState<T> = {
  key: keyof T;
  direction: SortDirection;
};
