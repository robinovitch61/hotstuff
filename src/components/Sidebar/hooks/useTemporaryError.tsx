import * as React from "react";
import config from "../../../config";
import { useState } from "react";

export default function useTemporaryError(): [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>,
  (errors: string[]) => void
] {
  const [errors, setErrors] = useState<string[]>([]);

  const setTemporaryErrors = (errors: string[]) => {
    setErrors(errors);
    setTimeout(() => setErrors([]), config.errorMessageDurationSeconds * 1000);
  };

  return [errors, setErrors, setTemporaryErrors];
}
