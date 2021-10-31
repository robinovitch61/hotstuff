import React, { useCallback } from "react";
import { StyledInput } from "./style";

interface CanBeMadeString {
  toString: () => string;
}

type EditableInputProps<T> = {
  initialValue: T;
  currentValue: string;
  setCurrentValue: (value: string) => void;
  onBlur: (value: T) => void;
  getNewValue: (event: React.ChangeEvent<HTMLInputElement>) => T | undefined;
};

export default function EditableInput<T extends CanBeMadeString>(
  props: EditableInputProps<T>
): React.ReactElement {
  const { initialValue, currentValue, setCurrentValue, onBlur, getNewValue } =
    props;

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = event.target.value;
      if (newVal !== undefined) {
        setCurrentValue(newVal);
      }
    },
    [setCurrentValue]
  );

  const handleOnBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = getNewValue(event);
      if (event.target.value === initialValue.toString()) {
        return;
      } else if (newVal !== undefined) {
        setCurrentValue(newVal.toString());
        onBlur(newVal);
      } else {
        setCurrentValue(initialValue.toString());
        onBlur(initialValue);
      }
    },
    [getNewValue, initialValue, onBlur, setCurrentValue]
  );

  return (
    <StyledInput
      type="text"
      value={currentValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
}
