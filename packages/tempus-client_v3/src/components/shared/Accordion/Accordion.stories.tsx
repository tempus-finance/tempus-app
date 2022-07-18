import { ComponentStory } from '@storybook/react';
import Accordion from './Accordion';
import { colors } from '../Colors';

export default {
  title: 'Accordion',
  component: Accordion,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof Accordion> = args => (
  <div style={style}>
    <Accordion {...args}>This is the content</Accordion>
  </div>
);

export const WidgetWithPendingIcon = Template.bind({});
WidgetWithPendingIcon.args = {
  iconVariant: 'pending',
  title: 'Pending transaction',
  defaultOpen: false,
};

export const WidgetWithSuccessIcon = Template.bind({});
WidgetWithSuccessIcon.args = {
  iconVariant: 'checkmark',
  iconColor: colors.textSuccess,
  title: 'Success transaction',
  defaultOpen: false,
};

export const WidgetWithFailedIcon = Template.bind({});
WidgetWithFailedIcon.args = {
  iconVariant: 'exclamation-error',
  iconColor: colors.textError,
  title: 'Failed transaction',
  defaultOpen: false,
};

export const WidgetDefaultOpen = Template.bind({});
WidgetDefaultOpen.args = {
  iconVariant: 'pending',
  title: 'Pending transaction',
  defaultOpen: true,
};
