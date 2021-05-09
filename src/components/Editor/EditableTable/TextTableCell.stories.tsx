import React from "react";
import TextTableCell, { TextTableCellProps } from "./TextTableCell";
import { Story, Meta } from "@storybook/react";

const Template: Story<TextTableCellProps> = (args) => (
  <TextTableCell {...args} />
);

export default {
  title: "Editable Table/TextTableCell",
  component: TextTableCell,
} as Meta;

export const EmptyTextTableCell = Template.bind({});
EmptyTextTableCell.args = {
  initialVal: undefined,
  onBlur: (newVal) => console.log(`set val to ${newVal}`),
};

export const PopulatedTextTableCell = Template.bind({});
PopulatedTextTableCell.args = {
  initialVal: "some val",
  onBlur: (newVal) => console.log(`set val to ${newVal}`),
};
