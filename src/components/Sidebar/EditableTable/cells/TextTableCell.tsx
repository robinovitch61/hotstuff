import React from "react";
import EditableStringInput from "../../EditableStringInput";

export type TextTableCellProps = {
  initialVal: string;
  onBlur: (newValue: string) => void;
  validator?: (val: string) => string;
};

export default function TextTableCell(
  props: TextTableCellProps
): React.ReactElement {
  return (
    <EditableStringInput
      initialValue={props.initialVal}
      onBlur={props.onBlur}
      validator={props.validator}
    />
  );
}
