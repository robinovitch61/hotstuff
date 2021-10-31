import React, { useState } from "react";
import EditableNumberInput from "../../EditableNumberInput";

export type NumericalTableCellProps = {
  initialVal: number;
  onBlur: (newValue: number) => void;
};

export default function NumericalTableCell(
  props: NumericalTableCellProps
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialVal.toString());

  return (
    <EditableNumberInput
      initialValue={props.initialVal}
      currentValue={value}
      setCurrentValue={setValue}
      onBlur={props.onBlur}
    />
  );
}
