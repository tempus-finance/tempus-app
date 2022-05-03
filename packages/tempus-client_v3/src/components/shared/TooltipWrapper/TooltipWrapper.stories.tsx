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
  tooltipContent: <Typography variant="body-primary">Tooltip</Typography>,
};

export const TooltipWrapperClickToOpen = Template.bind({});
TooltipWrapperClickToOpen.args = {
  tooltipContent: <Typography variant="body-primary">Tooltip</Typography>,
  openEvent: 'click',
};

export const TooltipWrapperHoverToOpen = Template.bind({});
TooltipWrapperHoverToOpen.args = {
  tooltipContent: <Typography variant="body-primary">Tooltip</Typography>,
  openEvent: 'mouseover',
};

export const TooltipWrapperBottomLeft = Template.bind({});
TooltipWrapperBottomLeft.args = {
  tooltipContent: <div style={{ width: '320px', height: '240px' }}>Tooltip</div>,
  placement: 'bottom-left',
};

export const TooltipWrapperBottomCenter = Template.bind({});
TooltipWrapperBottomCenter.args = {
  tooltipContent: <div style={{ width: '320px', height: '240px' }}>Tooltip</div>,
  placement: 'bottom-center',
};

export const TooltipWrapperBottomRight = Template.bind({});
TooltipWrapperBottomRight.args = {
  tooltipContent: <div style={{ width: '320px', height: '240px' }}>Tooltip</div>,
  placement: 'bottom-right',
};
