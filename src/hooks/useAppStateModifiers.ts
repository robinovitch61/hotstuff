import * as React from "react";
import { useCallback } from "react";
import { CanvasViewState } from "../components/Canvas/Canvas";
import { ModelOutput } from "hotstuff-network";
import { AppConnection, AppNode, AppState, Timing } from "../App";

export default function useAppStateModifiers(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
): [
  (newNodes: AppNode[]) => void,
  (newConnections: AppConnection[]) => void,
  (newCanvasState: CanvasViewState) => void,
  (newCanvasState: CanvasViewState) => void,
  (newTiming: Timing) => void,
  (newModelOutput: ModelOutput | undefined) => void
] {
  const setAppNodes = useCallback(
    (newNodes: AppNode[]) => {
      setAppState((prevState) => ({
        ...prevState,
        nodes: newNodes,
      }));
    },
    [setAppState]
  );

  const setAppConnections = useCallback(
    (newConnections: AppConnection[]) => {
      setAppState((prevState) => ({
        ...prevState,
        connections: newConnections,
      }));
    },
    [setAppState]
  );

  const setCanvasViewState = useCallback(
    (newCanvasState: CanvasViewState) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasViewState: newCanvasState,
      }));
    },
    [setAppState]
  );

  const setSavedCanvasState = useCallback(
    (newSavedCanvasState: CanvasViewState) => {
      setAppState((prevState) => ({
        ...prevState,
        savedCanvasState: newSavedCanvasState,
      }));
    },
    [setAppState]
  );

  const setTiming = useCallback(
    (newTiming: Timing) => {
      setAppState((prevState) => ({
        ...prevState,
        timing: newTiming,
        output: undefined,
      }));
    },
    [setAppState]
  );

  const setModelOutput = useCallback(
    (newModelOutput: ModelOutput | undefined) => {
      setAppState((prevState) => ({
        ...prevState,
        output: newModelOutput,
      }));
    },
    [setAppState]
  );

  return [
    setAppNodes,
    setAppConnections,
    setCanvasViewState,
    setSavedCanvasState,
    setTiming,
    setModelOutput,
  ];
}
