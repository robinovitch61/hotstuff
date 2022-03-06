import * as React from "react";

export default function useLocalStorageState<T>(
  defaultValue: T,
  key: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    const localState = window.localStorage.getItem(key);
    if (localState === null || localState === undefined) {
      return defaultValue;
    } else {
      return JSON.parse(localState) as T;
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
