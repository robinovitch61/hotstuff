import * as React from "react";
import { AppState, ExportedAppState } from "../../App";
import { ModelOutput } from "hotstuff-network";

export function nicelyFormattedJsonString<T>(toFormat: T): string {
  return JSON.stringify(toFormat, null, 2);
}

function isoFormattedCurrentTimeInLocalTime(): string {
  return new Date(
    new Date().setHours(
      new Date().getHours() - new Date().getTimezoneOffset() / 60
    )
  ).toISOString();
}

function getUrlForObject<T>(inputObject: T): string {
  const blob = new Blob([nicelyFormattedJsonString<T>(inputObject)], {
    type: "text/plain;charset=utf-8",
  });
  return URL.createObjectURL(blob);
}

export function downloadAppStateFromAnchor(
  ref: React.RefObject<HTMLAnchorElement | null>,
  appState: AppState
): void {
  if (ref.current) {
    const url = getUrlForObject<AppState>(appState);
    ref.current.setAttribute("href", url);

    ref.current.setAttribute(
      "download",
      `${isoFormattedCurrentTimeInLocalTime()}_thermal_model.json`
    );
  }
}

export function downloadExportedAppStateFromAnchor(
  ref: React.RefObject<HTMLAnchorElement | null>,
  exportedAppState: ExportedAppState
): void {
  if (ref.current) {
    const url = getUrlForObject<ExportedAppState>(exportedAppState);
    ref.current.setAttribute("href", url);

    ref.current.setAttribute(
      "download",
      `${isoFormattedCurrentTimeInLocalTime()}_thermal_model_with_results.json`
    );
  }
}

export function importFileFromUser(
  event: React.ChangeEvent<HTMLInputElement>,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  setOutput: React.Dispatch<React.SetStateAction<ModelOutput | undefined>>
): void {
  const files = event.target.files;
  if (!files || files.length === 0) {
    return;
  }
  const file = files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const contents = reader.result;
    if (!!contents && typeof contents === "string") {
      const inputObject = JSON.parse(contents);
      setAppState(inputObject);
      setOutput(inputObject.output);
    }
  };

  reader.readAsText(file);
}
