import React, { useCallback, useRef, useState } from "react";
import { StyledInput } from "./style";

interface CanBeMadeString {
  toString: () => string;
}

type EditableInputProps<T> = {
  initialValue: T;
  onBlur: (value: T) => void;
  getNewValue: (event: React.ChangeEvent<HTMLInputElement>) => T | undefined;
  afterValue?: string;
  validator: (value: string) => T;
  fontSize?: string;
};

export default function EditableInput<T extends CanBeMadeString>(
  props: EditableInputProps<T>
): React.ReactElement {
  const { initialValue, onBlur, getNewValue, afterValue, validator, fontSize } =
    props;

  const inputRef = useRef<HTMLInputElement>(null);

  const withAfterValue = useCallback(
    (val: string) => val + (afterValue || ""),
    [afterValue]
  );

  const [value, setValue] = useState<string>(
    withAfterValue(initialValue.toString())
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
        setValue((prevVal) => withAfterValue(prevVal));
        return;
      } else if (newVal !== undefined) {
        const validated = validator(newVal.toString());
        setValue(withAfterValue(validated.toString()));
        onBlur(validated);
      } else {
        const validated = validator(initialValue.toString());
        setValue(withAfterValue(validated.toString()));
        onBlur(validated);
      }
    },
    [getNewValue, initialValue, onBlur, validator, withAfterValue]
  );

  return (
    <StyledInput
      ref={inputRef}
      type="text"
      fontSize={fontSize}
      value={value}
      onChange={handleOnChange}
      onFocus={() =>
        setValue((prevVal) => prevVal.replace(afterValue || "", ""))
      }
      onBlur={handleOnBlur}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (["Escape", "Enter"].includes(event.key)) {
          inputRef.current && inputRef.current.blur();
        }
      }}
    />
  );
}
