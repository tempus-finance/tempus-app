import { ComponentStory } from '@storybook/react';
import React from 'react';
import TextInput from './TextInput';

export default {
  title: 'TextInput',
  component: TextInput,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof TextInput> = args => (
  <div style={style}>
    <TextInput {...args} />
  </div>
);

export const TextInputRaw = Template.bind({});
TextInputRaw.args = {
  placeholder: 'placeholder',
  pattern: '',
  disabled: false,
  debounce: false,
  startAdornment: null,
  endAdornment: null,
  onChange: () => false,
};

export const TextInputNormal = Template.bind({});
TextInputNormal.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  disabled: false,
  debounce: false,
  startAdornment: null,
  endAdornment: null,
  onChange: () => false,
};

export const TextInputCaption = Template.bind({});
TextInputCaption.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  disabled: false,
  debounce: false,
  startAdornment: null,
  endAdornment: null,
  onChange: () => false,
};

export const TextInputError = Template.bind({});
TextInputError.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  error: 'error here',
  disabled: false,
  debounce: false,
  startAdornment: null,
  endAdornment: null,
  onChange: () => false,
};

export const TextInputDisabled = Template.bind({});
TextInputDisabled.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  disabled: true,
  debounce: false,
  startAdornment: null,
  endAdornment: null,
  onChange: () => false,
};
