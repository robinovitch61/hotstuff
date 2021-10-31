import React, { useState } from "react";
import { StyledInput } from "../style";

export type NumericalTableCellProps = {
  initialVal: number;
  onBlur: (newValue: number) => void;
};

function getFloatVal(
  event: React.ChangeEvent<HTMLInputElement>
): number | undefined {
  const newValueText = event.target.value;
  const newValueFloat = parseFloat(event.target.value);
  if (
    newValueText === undefined ||
    isNaN(newValueFloat) // things like 123.3abc will still parse as 123.3
  ) {
    return undefined;
  }
  return newValueFloat;
}

export default function NumericalTableCell(
  props: NumericalTableCellProps
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialVal.toString());

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value;
    if (newVal !== undefined) {
      setValue(newVal);
    }
  }

  function handleOnBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = getFloatVal(event);
    if (event.target.value === props.initialVal.toString()) {
      return;
    } else if (newVal !== undefined) {
      setValue(newVal.toString());
      props.onBlur(newVal);
    } else {
      setValue(props.initialVal.toString());
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
