import React, { useCallback, useState } from "react";
import { StyledInput } from "./style";

interface CanBeMadeString {
  toString: () => string;
}

type EditableInputProps<T> = {
  initialValue: T;
  onBlur: (value: T) => void;
  getNewValue: (event: React.ChangeEvent<HTMLInputElement>) => T | undefined;
  afterValue?: string;
};

export default function EditableInput<T extends CanBeMadeString>(
  props: EditableInputProps<T>
): React.ReactElement {
  const { initialValue, onBlur, getNewValue, afterValue } = props;

  const [value, setValue] = useState<string>(
    initialValue.toString() + (afterValue || "")
  );

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
        setValue((prevVal) => prevVal + (afterValue || ""));
        return;
      } else if (newVal !== undefined) {
        setValue(newVal.toString() + (afterValue || ""));
        onBlur(newVal);
      } else {
        setValue(initialValue.toString() + (afterValue || ""));
        onBlur(initialValue);
      }
    },
    [afterValue, getNewValue, initialValue, onBlur]
  );

  return (
    <StyledInput
      type="text"
      value={value}
      onChange={handleOnChange}
      onFocus={() =>
        setValue((prevVal) => prevVal.replace(afterValue || "", ""))
      }
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
