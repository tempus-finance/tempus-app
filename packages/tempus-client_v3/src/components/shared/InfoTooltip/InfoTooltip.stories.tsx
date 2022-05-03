import { ComponentStory } from '@storybook/react';
import Icon from '../Icon';

import InfoTooltip from './InfoTooltip';

export default {
  title: 'InfoTooltip',
  component: InfoTooltip,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof InfoTooltip> = args => (
  <div style={style}>
    <InfoTooltip {...args} />
  </div>
);

export const InfoTooltipClick = Template.bind({});
InfoTooltipClick.args = {
  tooltipContent: 'content',
  openEvent: 'click',
};

export const InfoTooltipMouseover = Template.bind({});
InfoTooltipMouseover.args = {
  tooltipContent: 'content',
  openEvent: 'mouseover',
};

export const InfoTooltipWithErrorIcon = Template.bind({});
InfoTooltipWithErrorIcon.args = {
  tooltipContent: 'content',
  openEvent: 'click',
  iconVariant: 'exclamation-error',
  iconSize: 'large',
};

export const InfoTooltipWithCustomContent = Template.bind({});
InfoTooltipWithCustomContent.args = {
  tooltipContent: <Icon variant="info-bordered" size={96} />,
  openEvent: 'click',
};

export const InfoTooltipWithCustomAnchor = Template.bind({});
InfoTooltipWithCustomAnchor.args = {
  tooltipContent: <Icon variant="info-bordered" size={96} />,
  children: <div>anchor</div>,
};
