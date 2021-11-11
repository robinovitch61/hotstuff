import React from "react";
import EditableInput from "./EditableInput";

type EditableStringInputProps = {
  initialValue: string;
  onBlur: (value: string) => void;
};

export default function EditableStringInput(
  props: EditableStringInputProps
): React.ReactElement {
  return (
    <EditableInput<string>
      key={props.initialValue}
      initialValue={props.initialValue}
      onBlur={props.onBlur}
      getNewValue={(event: React.ChangeEvent<HTMLInputElement>) =>
        event.target.value
      }
    />
  );
}
