import React from "react";
import config from "../../../config";
import { StyledDeleteCell } from "./style";
import CrossMark from "../../../img/icons/CrossMark";

type DeleteCellProps<T> = {
  row: T;
  onDeleteRow: (row: T) => void;
};

export default function DeleteCell<T>(
  props: DeleteCellProps<T>
): React.ReactElement {
  return (
    <StyledDeleteCell
      tabIndex={0}
      onKeyUp={(event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          props.onDeleteRow(props.row);
        }
      }}
      width={config.tableDeleteCellWidthPercent}
      minWidth={config.tableDeleteCellMinWidthPx}
      onClick={() => props.onDeleteRow(props.row)}
    >
      <CrossMark />
    </StyledDeleteCell>
  );
}
