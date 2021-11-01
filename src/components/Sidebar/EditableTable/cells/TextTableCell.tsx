import React from "react";
import EditableStringInput from "../../EditableStringInput";

export type TextTableCellProps = {
  initialVal: string;
  onBlur: (newValue: string) => void;
};

export default function TextTableCell(
  props: TextTableCellProps
): React.ReactElement {
  return (
    <EditableStringInput
      initialValue={props.initialVal}
      onBlur={props.onBlur}
    />
  );
}
