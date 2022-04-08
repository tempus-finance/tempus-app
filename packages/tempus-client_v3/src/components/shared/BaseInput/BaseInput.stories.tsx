import { ComponentStory } from '@storybook/react';
import React from 'react';
import BaseInput from './BaseInput';

export default {
  title: 'BaseInput',
  component: BaseInput,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof BaseInput> = args => (
  <div style={style}>
    <BaseInput {...args} />
  </div>
);

export const BaseInputNormal = Template.bind({});
BaseInputNormal.args = {
  placeholder: 'placeholder',
  pattern: '',
  disabled: false,
  debounce: false,
  onChange: () => false,
};

export const BaseInputDisabled = Template.bind({});
BaseInputDisabled.args = {
  placeholder: 'placeholder',
  pattern: '',
  disabled: true,
  debounce: false,
  onChange: () => false,
};
