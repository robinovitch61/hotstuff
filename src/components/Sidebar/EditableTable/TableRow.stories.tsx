import React from "react";
import TableRow, { TableRowProps } from "./TableRow";
import { Story, Meta } from "@storybook/react";
import { Column } from "./EditableTable";

type StoryType = {
  id: string;
  name: string;
  number: number;
  isActive: boolean;
};

const Template: Story<TableRowProps<StoryType>> = (args) => (
  <TableRow {...args} />
);

export default {
  title: "Editable Table/TableRow",
  component: TableRow,
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

const tableRowArgs = {
  onDeleteRow: (data: StoryType) =>
    console.log(`delete ${JSON.stringify(data)}`),
  data: { id: "1", name: "Leo", number: 1, isActive: true },
  columns,
  updateRow: (data: StoryType) =>
    console.log(`updating ${JSON.stringify(data)}`),
  deleteable: true,
};

export const ATableRow = Template.bind({});
ATableRow.args = {
  ...tableRowArgs,
};
