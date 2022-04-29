import { ComponentStory, ComponentMeta } from '@storybook/react';
import Typography from '../Typography';

import TooltipWrapper from './TooltipWrapper';

export default {
  title: 'TooltipWrapper',
  component: TooltipWrapper,
  argTypes: {},
} as ComponentMeta<typeof TooltipWrapper>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof TooltipWrapper> = args => (
  <div style={style}>
    <TooltipWrapper {...args}>
      <Typography variant="title">anchor</Typography>
    </TooltipWrapper>
  </div>
);

export const TooltipWrapperSimple = Template.bind({});
TooltipWrapperSimple.args = {
  tooltip: <Typography variant="body-primary">Tooltip</Typography>,
};

export const TooltipWrapperClickToOpen = Template.bind({});
TooltipWrapperClickToOpen.args = {
  tooltip: <Typography variant="body-primary">Tooltip</Typography>,
  openEvent: 'click',
};

export const TooltipWrapperHoverToOpen = Template.bind({});
TooltipWrapperHoverToOpen.args = {
  tooltip: <Typography variant="body-primary">Tooltip</Typography>,
  openEvent: 'mouseover',
};
