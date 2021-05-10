import React from "react";
import EditableTable, { EditableTableProps } from "./EditableTable";
import { Story, Meta } from "@storybook/react";

type StoryType = {
  name: string;
  number: number;
  isActive: boolean;
};

const Template: Story<EditableTableProps<StoryType>> = (args) => (
  <EditableTable {...args} />
);

export default {
  title: "Editable Table/EditableTable",
  component: EditableTable,
} as Meta;

const editableTableArgs = {
  onDeleteRow: (data) => console.log(`delete ${JSON.stringify(data)}`),
  data: { name: "Leo", number: 1, isActive: "yes" },
  columns: [
    {
      text: "Person Name",
      key: "name",
      cellType: "text",
      width: 0.33,
    },
    {
      text: "Person Number",
      key: "number",
      cellType: "numeric",
      width: 0.33,
    },
    {
      text: "Is Active?",
      key: "isActive",
      cellType: "boolean",
      width: 0.33,
    },
  ],
  updateRow: (data) => console.log(`updating ${JSON.stringify(data)}`),
  deleteable: true,
};

export const AnEditableTable = Template.bind({});
AnEditableTable.args = {
  ...editableTableArgs,
};
