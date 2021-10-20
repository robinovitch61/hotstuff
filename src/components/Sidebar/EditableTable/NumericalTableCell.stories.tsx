import * as React from "react";
import NumericalTableCell, {
  NumericalTableCellProps,
} from "./NumericalTableCell";
import { Story, Meta } from "@storybook/react";

const Template: Story<NumericalTableCellProps> = (args) => (
  <NumericalTableCell {...args} />
);

export default {
  title: "Editable Table/NumericalTableCell",
  component: NumericalTableCell,
} as Meta;

export const EmptyNumericalTableCell = Template.bind({});
EmptyNumericalTableCell.args = {
  initialVal: undefined,
  onBlur: (newVal) => console.log(`set val to ${newVal}`),
};

export const PopulatedNumericalTableCell = Template.bind({});
PopulatedNumericalTableCell.args = {
  initialVal: 1,
  onBlur: (newVal) => console.log(`set val to ${newVal}`),
};
