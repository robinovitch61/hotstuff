import * as React from "react";
import BooleanTableCell, { BooleanTableCellProps } from "./BooleanTableCell";
import { Story, Meta } from "@storybook/react";

const Template: Story<BooleanTableCellProps> = (args) => (
  <BooleanTableCell {...args} />
);

export default {
  title: "Editable Table/BooleanTableCell",
  component: BooleanTableCell,
} as Meta;

export const EmptyBooleanTableCell = Template.bind({});
EmptyBooleanTableCell.args = {
  initialIsActive: false,
  onClick: () => {
    console.log("clicked!");
  },
  showWhenActive: "",
};

export const PopulatedBooleanTableCell = Template.bind({});
PopulatedBooleanTableCell.args = {
  initialIsActive: true,
  onClick: () => {
    console.log("clicked!");
  },
  showWhenActive: "✅",
};
