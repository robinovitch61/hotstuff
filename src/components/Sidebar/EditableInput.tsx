import React, { useCallback, useState } from "react";
import { StyledInput } from "./style";

interface CanBeMadeString {
  toString: () => string;
}

type EditableInputProps<T> = {
  initialValue: T;
  onBlur: (value: T) => void;
  getNewValue: (event: React.ChangeEvent<HTMLInputElement>) => T | undefined;
};

export default function EditableInput<T extends CanBeMadeString>(
  props: EditableInputProps<T>
): React.ReactElement {
  const [value, setValue] = useState<string>(props.initialValue.toString());

  const { initialValue, onBlur, getNewValue } = props;

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value;
    if (newVal !== undefined) {
      setValue(newVal);
    }
  }

  const handleOnBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = getNewValue(event);
      if (event.target.value === initialValue.toString()) {
        return;
      } else if (newVal !== undefined) {
        setValue(newVal.toString());
        onBlur(newVal);
      } else {
        setValue(initialValue.toString());
        onBlur(initialValue);
      }
    },
    [getNewValue, initialValue, onBlur]
  );

  return (
    <StyledInput
      type="text"
      value={value}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      // TODO LEO
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
        } else if (event.key === "Enter") {
        }
      }}
    />
  );
}
