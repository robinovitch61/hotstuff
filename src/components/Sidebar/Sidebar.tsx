import * as React from "react";
import {
  AppConnection,
  AppNode,
  AppState,
  ModalState,
  Timing,
} from "../../App";
import NodeTable from "./EditableTable/NodeTable/NodeTable";
import ConnectionTable from "./EditableTable/ConnectionTable/ConnectionTable";
import Tabs from "../Tabs/Tabs";
import ModelControls from "./ModelControls";
import {
  StyledEditor,
  StyledModelControlsWrapper,
  StyledTables,
} from "./style";
import { ModelOutput } from "hotstuff-network";
import useTemporaryError from "./hooks/useTemporaryError";
import config from "../../config";
import ErrorModal from "../Modal/ErrorModal";

type SidebarProps = {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setOutput: React.Dispatch<React.SetStateAction<ModelOutput | undefined>>;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  width: number;
  height: number;
  setTiming: (newTiming: Timing) => void;
  onAddNode: () => void;
  onAddConnection: () => void;
  updateNodes: (nodes: AppNode[], clearActiveNodes: boolean) => void;
  deleteNodes: (nodeIds: string[]) => void;
  setActiveNodes: (nodeIds: string[]) => void;
  updateConnections: (connections: AppConnection[]) => void;
  deleteConnections: (connectionIds: string[]) => void;
  onRunModel: () => ModelOutput | undefined;
};

export default function Sidebar(props: SidebarProps): React.ReactElement {
  const {
    appState,
    setAppState,
    setOutput,
    setModalState,
    width,
    height,
    setTiming,
    onAddNode,
    onAddConnection,
    updateNodes,
    deleteNodes,
    setActiveNodes,
    updateConnections,
    deleteConnections,
    onRunModel,
  } = props;

  const [tableErrors, setTableErrors, setTemporaryTableErrors] =
    useTemporaryError();
  const [
    modelControlsErrors,
    setModelControlsErrors,
    setTemporaryModelControlsErrors,
  ] = useTemporaryError();

  const nodeTable = (
    <NodeTable
      rows={appState.nodes}
      onUpdateRow={(node: AppNode) => updateNodes([node], false)}
      onDeleteRow={(node: AppNode) => deleteNodes([node.id])}
      onAddButton={onAddNode}
      onClickEditableCell={(rowId: string) => setActiveNodes([rowId])}
      setTemporaryErrors={setTemporaryTableErrors}
    />
  );

  const connectionTable = (
    <ConnectionTable
      rows={appState.connections}
      nodes={appState.nodes}
      onUpdateRow={(connection: AppConnection) =>
        updateConnections([connection])
      }
      onDeleteRow={(connection: AppConnection) =>
        deleteConnections([connection.id])
      }
      onAddButton={onAddConnection}
      setTemporaryErrors={setTemporaryTableErrors}
    />
  );

  return (
    <StyledEditor width={width} height={height}>
      <StyledTables heightFrac={appState.panelSizes.tableHeightFraction}>
        <ErrorModal errors={tableErrors} setErrors={setTableErrors} />
        <Tabs
          tabs={[
            { text: "Nodes", component: nodeTable, width: 0.5 },
            { text: "Connections", component: connectionTable, width: 0.5 },
          ]}
        />
      </StyledTables>
      <StyledModelControlsWrapper
        heightFrac={1 - appState.panelSizes.tableHeightFraction}
      >
        <ErrorModal
          errors={modelControlsErrors}
          setErrors={setModelControlsErrors}
        />
        <ModelControls
          appState={appState}
          setAppState={setAppState}
          setOutput={setOutput}
          setModalState={setModalState}
          onRunModel={() => {
            if (
              Math.ceil(
                appState.timing.totalTimeS / appState.timing.timeStepS
              ) > config.maxTimeSteps
            ) {
              setTemporaryModelControlsErrors([
                `Decrease model run time or increase time step size`,
              ]);
              return;
            }
            return onRunModel();
          }}
          setTiming={setTiming}
        />
      </StyledModelControlsWrapper>
    </StyledEditor>
  );
}
