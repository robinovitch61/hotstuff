import * as React from "react";
import DropDownTableCell from "./cells/DropDownTableCell";
import TextTableCell from "./cells/TextTableCell";
import NumericalTableCell from "./cells/NumericalTableCell";
import BooleanTableCell from "./cells/BooleanTableCell";
import { CellOption, TableColumn } from "./types";

type TableCellType = {
  id: string;
};

type TableCellProps<T extends TableCellType> = {
  row: T;
  col: TableColumn<T>;
  onUpdateRow: (row: T) => void;
  options?: CellOption[];
  initiallySetOption?: CellOption;
  afterValue?: string;
};

export default function TableCell<T extends TableCellType>(
  props: TableCellProps<T>
): React.ReactElement {
  const { row, col, onUpdateRow, options, initiallySetOption, afterValue } =
    props;
  const initialVal = row[col.key];

  if (!!options && options.length > 0 && col.onSelectOption) {
    return (
      <DropDownTableCell
        key={row.id}
        rowId={row.id}
        options={options}
        setOption={initiallySetOption}
        onSelectOption={col.onSelectOption}
      />
    );
  } else if (typeof initialVal === "string") {
    return (
      <TextTableCell
        initialVal={initialVal}
        onBlur={(newVal) => onUpdateRow({ ...row, [col.key]: newVal })}
      />
    );
  } else if (
    typeof initialVal === "number" &&
    typeof row[col.key] === "number"
  ) {
    return (
      <NumericalTableCell
        initialVal={initialVal}
        onBlur={(newVal) => onUpdateRow({ ...row, [col.key]: newVal })}
        afterValue={afterValue}
      />
    );
  } else if (typeof initialVal === "boolean") {
    return (
      <BooleanTableCell
        key={initialVal.toString()}
        initialIsActive={initialVal}
        onClick={(newVal) => onUpdateRow({ ...row, [col.key]: newVal })}
        showWhenActive={"✅"}
      />
    );
  } else {
    return <></>;
  }
}
