import { useEffect, useRef } from "react";

export default function useLast<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // return previous value (happens before update in useEffect above)
  return ref.current;
}
