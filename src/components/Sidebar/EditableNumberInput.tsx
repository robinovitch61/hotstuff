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
  currentValue: string;
  setCurrentValue: (value: string) => void;
  onBlur: (value: number) => void;
};

export default function EditableNumberInput(
  props: EditableNumberInputProps
): React.ReactElement {
  return (
    <EditableInput<number>
      initialValue={props.initialValue}
      currentValue={props.currentValue}
      setCurrentValue={props.setCurrentValue}
      onBlur={props.onBlur}
      getNewValue={getFloatVal}
    />
  );
}
