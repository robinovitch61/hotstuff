import React from "react";
import EditableNumberInput from "../../EditableNumberInput";

export type NumericalTableCellProps = {
  initialVal: number;
  onBlur: (newValue: number) => void;
};

export default function NumericalTableCell(
  props: NumericalTableCellProps
): React.ReactElement {
  return (
    <EditableNumberInput
      initialValue={props.initialVal}
      onBlur={props.onBlur}
    />
  );
}
