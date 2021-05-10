import React, { useState } from "react";
import { StyledInput } from "./sharedStyled";

export type TextTableCellProps = {
  initialVal: string;
  onBlur: (newValue: string) => void;
};

export default function TextTableCell(
  props: TextTableCellProps
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialVal);

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value;
    if (newVal === undefined) {
      setValue("");
    } else {
      setValue(newVal);
    }
  }

  function handleOnBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value;
    if (newVal !== undefined && newVal !== props.initialVal) {
      setValue(newVal);
      props.onBlur(newVal);
    } else {
      setValue(props.initialVal);
      props.onBlur(props.initialVal);
    }
  }

  return (
    <StyledInput
      type="text"
      value={value}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
}
