import * as React from "react";
import config from "../../../config";
import { useState } from "react";

export default function useTemporaryError(): [
  string | undefined,
  React.Dispatch<React.SetStateAction<string | undefined>>,
  (error: string) => void
] {
  const [error, setError] = useState<string | undefined>();

  const setTemporaryError = (error: string) => {
    setError(error);
    setTimeout(
      () => setError(undefined),
      config.errorMessageDurationSeconds * 1000
    );
  };

  return [error, setError, setTemporaryError];
}
