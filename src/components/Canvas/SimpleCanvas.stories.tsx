import { Story, Meta } from "@storybook/react";
import SimpleCanvas, { SimpleCanvasProps } from "./SimpleCanvas";

const Template: Story<SimpleCanvasProps> = (args) => <SimpleCanvas {...args} />;

export default {
  title: "SimpleCanvas",
  component: SimpleCanvas,
} as Meta;

export const ASimpleCanvas = Template.bind({});
ASimpleCanvas.args = {
  canvasWidth: 400,
  canvasHeight: 200,
};
