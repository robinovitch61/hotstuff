import { useEffect, useRef } from "react";

export default function useLast<T>(
  value: T
): React.MutableRefObject<T | undefined> {
  const ref = useRef<T>();
  // useEffect runs AFTER a render if a dependency has changed
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // return previous value
  return ref;
}
