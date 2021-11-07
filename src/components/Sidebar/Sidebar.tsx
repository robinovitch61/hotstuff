import * as React from "react";
import styled from "styled-components/macro";
import { AppConnection, AppNode, AppState, Timing } from "../../App";
import NodeTable from "./EditableTable/NodeTable/NodeTable";
import ConnectionTable from "./EditableTable/ConnectionTable/ConnectionTable";
import Tabs from "../Tabs/Tabs";
import ModelControls from "./ModelControls";
import getNewAppNode from "../../utils/nodeConnectionUtils";
import { ORIGIN, Point } from "../../utils/pointUtils";

const StyledEditor = styled.div<{ width: number; height: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  border-left: 3px solid black;
`;

const StyledTables = styled.div`
  display: inline-flex;
  width: 100%;
  height: 50%;
`;

const StyledModelControlsWrapper = styled.div`
  display: inline-flex;
  width: 100%;
`;

type SidebarProps = {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  width: number;
  height: number;
  timing: Timing;
  setTiming: (newTiming: Timing) => void;
  appNodes: AppNode[];
  onAddNode: () => void;
  appConnections: AppConnection[];
  addConnection: (connection: AppConnection) => void;
  updateNodes: (nodes: AppNode[], clearActiveNodes: boolean) => void;
  deleteNodes: (nodeIds: string[]) => void;
  updateConnections: (connections: AppConnection[]) => void;
  deleteConnections: (connectionIds: string[]) => void;
  onRunModel: () => void;
};

export default function Sidebar(props: SidebarProps): React.ReactElement {
  const nodeTable = (
    <NodeTable
      rows={props.appNodes}
      onUpdateRow={(node: AppNode) => props.updateNodes([node], false)}
      onDeleteRow={(node: AppNode) => props.deleteNodes([node.id])}
      onAddButton={props.onAddNode}
    />
  );

  const connectionTable = (
    <ConnectionTable
      rows={props.appConnections}
      nodes={props.appNodes}
      onUpdateRow={(connection: AppConnection) =>
        props.updateConnections([connection])
      }
      onDeleteRow={(connection: AppConnection) =>
        props.deleteConnections([connection.id])
      }
    />
  );

  return (
    <StyledEditor width={props.width} height={props.height}>
      <StyledTables>
        <Tabs
          tabs={[
            { text: "Nodes", component: nodeTable, width: 0.5 },
            { text: "Connections", component: connectionTable, width: 0.5 },
          ]}
        />
      </StyledTables>
      <StyledModelControlsWrapper>
        <ModelControls
          appState={props.appState}
          setAppState={props.setAppState}
          onRunModel={props.onRunModel}
          timing={props.timing}
          setTiming={props.setTiming}
        />
      </StyledModelControlsWrapper>
    </StyledEditor>
  );
}
