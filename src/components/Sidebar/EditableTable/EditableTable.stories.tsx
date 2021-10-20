import * as React from "react";
import EditableTable, { Column, EditableTableProps } from "./EditableTable";
import { Story, Meta } from "@storybook/react";
import { SortState } from "./SortableTableHeader";

type StoryType = {
  id: string;
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

const columns: Column<StoryType>[] = [
  {
    text: "Person Name",
    key: "name",
    width: 0.33,
  },
  {
    text: "Person Number",
    key: "number",
    width: 0.33,
  },
  {
    text: "Is Active?",
    key: "isActive",
    width: 0.33,
  },
];

const data: StoryType[] = [
  { id: "1", name: "Leo", number: 1, isActive: true },
  { id: "2", name: "Bob", number: 2, isActive: false },
];

const sortState: SortState<StoryType> = { key: "name", direction: "ASC" };

const editableTableArgs = {
  columns,
  data,
  onUpdateRow: (data: StoryType) =>
    console.log(`updating ${JSON.stringify(data)}`),
  onDeleteRow: (data: StoryType) =>
    console.log(`delete ${JSON.stringify(data)}`),
  sortState,
};

export const AnEditableTable = Template.bind({});
AnEditableTable.args = {
  ...editableTableArgs,
};
