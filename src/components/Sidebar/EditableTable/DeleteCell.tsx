import React from "react";
import config from "../../../config";
import { StyledDeleteCell } from "./style";

type DeleteCellProps<T> = {
  row: T;
  onDeleteRow: (row: T) => void;
};

export default function DeleteCell<T>(props: DeleteCellProps<T>) {
  return (
    <StyledDeleteCell
      tabIndex={0}
      onKeyUp={(event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          props.onDeleteRow(props.row);
        }
      }}
      width={config.tableDeleteCellWidthPerc}
      minWidth={config.tableDeleteCellMinWidthPx}
      onClick={() => props.onDeleteRow(props.row)}
    >
      ❌
    </StyledDeleteCell>
  );
}
