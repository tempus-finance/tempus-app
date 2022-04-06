import { ComponentStory } from '@storybook/react';
import React from 'react';
import NumberInput from './NumberInput';

export default {
  title: 'NumberInput',
  component: NumberInput,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof NumberInput> = args => (
  <div style={style}>
    <NumberInput {...args} />
  </div>
);

export const NumberInputRaw = Template.bind({});
NumberInputRaw.args = {
  placeholder: 'placeholder',
  max: 100,
  disabled: false,
  debounce: false,
  onChange: () => false,
};

export const NumberInputNormal = Template.bind({});
NumberInputNormal.args = {
  label: 'number input',
  placeholder: 'placeholder',
  max: 100,
  disabled: false,
  debounce: false,
  onChange: () => false,
};

export const NumberInputCaption = Template.bind({});
NumberInputCaption.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  disabled: false,
  debounce: false,
  onChange: () => false,
};

export const NumberInputError = Template.bind({});
NumberInputError.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  error: 'error here',
  max: 100,
  disabled: false,
  debounce: false,
  onChange: () => false,
};

export const NumberInputDisabled = Template.bind({});
NumberInputDisabled.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  disabled: true,
  debounce: false,
  onChange: () => false,
};
