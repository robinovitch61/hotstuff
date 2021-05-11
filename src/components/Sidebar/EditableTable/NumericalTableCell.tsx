import React, { useCallback, useState } from "react";
import { StyledInput } from "./sharedStyled";

export type NumericalTableCellProps = {
  initialVal: number;
  onBlur: (newValue: number) => void;
};

export default function NumericalTableCell(
  props: NumericalTableCellProps
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialVal.toString());
  const getFloatVal = useCallback((event: React.ChangeEvent<HTMLInputElement>):
    | number
    | undefined => {
    const newValueText = event.target.value;
    const newValueFloat = parseFloat(event.target.value);
    if (
      newValueText === undefined ||
      isNaN(newValueFloat) // things like 123.3abc will still parse as 123.3
    ) {
      return undefined;
    }
    return newValueFloat;
  }, []);

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value;
    if (newVal === undefined) {
      setValue("");
    } else {
      setValue(newVal);
    }
  }

  function handleOnBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = getFloatVal(event);
    if (newVal !== undefined && newVal !== props.initialVal) {
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
