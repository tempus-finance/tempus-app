import { ComponentStory } from '@storybook/react';
import React, { FC, useCallback, useState } from 'react';
import BaseInput, { BaseInputProps } from './BaseInput';

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

const Wrapper: FC<BaseInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  const onChange = useCallback((val: string) => setValue(val), []);
  return <BaseInput {...props} value={value} onChange={onChange} />;
};

const Template: ComponentStory<typeof BaseInput> = args => (
  <div style={style}>
    <Wrapper {...args} />
  </div>
);

export const BaseInputNormal = Template.bind({});
BaseInputNormal.args = {
  value: 'value',
  placeholder: 'placeholder',
  pattern: '',
  disabled: false,
  debounce: false,
};

export const BaseInputDisabled = Template.bind({});
BaseInputDisabled.args = {
  value: 'value',
  placeholder: 'placeholder',
  pattern: '',
  disabled: true,
  debounce: false,
};

export const BaseInputLetterOnly = Template.bind({});
BaseInputLetterOnly.args = {
  value: 'value',
  placeholder: 'placeholder',
  pattern: '[a-zA-Z]*',
  disabled: false,
  debounce: false,
};

export const BaseInputDebounce = Template.bind({});
BaseInputDebounce.args = {
  value: 'value',
  placeholder: 'placeholder',
  pattern: '',
  disabled: false,
  debounce: true,
  onDebounceChange: value => console.log(value),
};
