import React from "react";
import EditableInput from "./EditableInput";

type EditableStringInputProps = {
  initialValue: string;
  onBlur: (value: string) => void;
  validator?: (val: string) => string;
};

export default function EditableStringInput(
  props: EditableStringInputProps
): React.ReactElement {
  const validator = (val: string) =>
    props.validator ? props.validator(val) : val;

  return (
    <EditableInput<string>
      key={props.initialValue}
      initialValue={props.initialValue}
      onBlur={props.onBlur}
      getNewValue={(event: React.ChangeEvent<HTMLInputElement>) =>
        event.target.value
      }
      validator={validator}
    />
  );
}
