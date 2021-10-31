import * as React from "react";
import styled from "styled-components/macro";
import { AppConnection, AppNode } from "../../App";
import NodeTable from "./EditableTable/NodeTable/NodeTable";
import ConnectionTable from "./EditableTable/ConnectionTable/ConnectionTable";
import Tabs from "../Tabs/Tabs";
import ModelControls from "./ModelControls";

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
  width: number;
  height: number;
  nodes: AppNode[];
  connections: AppConnection[];
  addNode: (node: AppNode) => void;
  updateNodes: (nodes: AppNode[], clearActiveNodes: boolean) => void;
  deleteNodes: (nodeIds: string[]) => void;
  updateConnections: (connections: AppConnection[]) => void;
  deleteConnections: (connectionIds: string[]) => void;
  updateActiveNodes: (nodeIds: string[], sticky: boolean) => void;
  clearActiveNodes: () => void;
};

export default function Sidebar(props: SidebarProps): React.ReactElement {
  const nodeTable = (
    <NodeTable
      rows={props.nodes}
      onUpdateRow={(node: AppNode) => props.updateNodes([node], false)}
      onDeleteRow={(node: AppNode) => props.deleteNodes([node.id])}
    />
  );

  const connectionTable = (
    <ConnectionTable
      rows={props.connections}
      nodes={props.nodes}
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
        <ModelControls onRunModel={() => alert("run!")} />
      </StyledModelControlsWrapper>
    </StyledEditor>
  );
}
