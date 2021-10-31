import React, { useState } from "react";
import EditableStringInput from "../../EditableStringInput";

export type TextTableCellProps = {
  initialVal: string;
  onBlur: (newValue: string) => void;
};

export default function TextTableCell(
  props: TextTableCellProps
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialVal);

  return (
    <EditableStringInput
      initialValue={props.initialVal}
      currentValue={value}
      setCurrentValue={setValue}
      onBlur={props.onBlur}
    />
  );
}
