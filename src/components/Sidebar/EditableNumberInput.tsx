import React from "react";
import EditableInput from "./EditableInput";

function getFloatVal(
  event: React.ChangeEvent<HTMLInputElement>
): number | undefined {
  const newValueText = event.target.value;
  // things like 123.3abc will still parse as 123.3
  const newValueFloat = parseFloat(event.target.value);
  if (newValueText === undefined || isNaN(newValueFloat)) {
    return undefined;
  }
  return newValueFloat;
}

type EditableNumberInputProps = {
  initialValue: number;
  onBlur: (value: number) => void;
  afterValue?: string;
  validator?: (val: string) => string;
};

export default function EditableNumberInput(
  props: EditableNumberInputProps
): React.ReactElement {
  const validator = (val: string) =>
    props.validator
      ? parseFloat(props.validator(val.toString()))
      : parseFloat(val);

  return (
    <EditableInput<number>
      key={props.initialValue + (props.afterValue || "")}
      initialValue={props.initialValue}
      onBlur={props.onBlur}
      getNewValue={getFloatVal}
      afterValue={props.afterValue}
      validator={validator}
    />
  );
}
