import * as React from "react";
import styled from "styled-components";
import { AppNode } from "../App";
import NodeTable from "./EditableTable/NodeTable";
import Tabs from "../Tabs/Tabs";

const StyledEditor = styled.div<{ width: number; height: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  border: 1px solid orange;
`;

type EditorProps = {
  width: number;
  height: number;
  nodes: AppNode[];
  addNode: (node: AppNode) => void;
  deleteNodes: (nodeIds: string[]) => void;
  updateNodes: (nodes: AppNode[]) => void;
  updateActiveNodes: (nodeIds: string[], sticky: boolean) => void;
  clearActiveNodes: () => void;
};

export default function Editor(props: EditorProps) {
  const nodeTable = (
    <NodeTable
      rows={props.nodes}
      onUpdateRow={(node: AppNode) => props.updateNodes([node])}
      onDeleteRow={(node: AppNode) => props.deleteNodes([node.id])}
    />
  );
  return (
    <StyledEditor width={props.width} height={props.height}>
      <Tabs
        tabs={[
          { text: "Nodes", component: nodeTable, width: 0.5 },
          { text: "Connections", component: <h1>hi</h1>, width: 0.5 },
        ]}
      />
    </StyledEditor>
  );
}
