import React from "react";
import EditableInput from "./EditableInput";

type EditableStringInputProps = {
  initialValue: string;
  currentValue: string;
  setCurrentValue: (value: string) => void;
  onBlur: (value: string) => void;
};

export default function EditableStringInput(
  props: EditableStringInputProps
): React.ReactElement {
  return (
    <EditableInput<string>
      initialValue={props.initialValue}
      currentValue={props.currentValue}
      setCurrentValue={props.setCurrentValue}
      onBlur={props.onBlur}
      getNewValue={(event: React.ChangeEvent<HTMLInputElement>) =>
        event.target.value
      }
    />
  );
}
