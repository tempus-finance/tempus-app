import { ComponentStory } from '@storybook/react';
import React, { FC, useCallback, useState } from 'react';
import NumberInput, { NumberInputProps } from './NumberInput';

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

const Wrapper: FC<NumberInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  const onChange = useCallback((val: string) => setValue(val), []);
  return <NumberInput {...props} value={value} onChange={onChange} />;
};

const Template: ComponentStory<typeof NumberInput> = args => (
  <div style={style}>
    <Wrapper {...args} />
  </div>
);

export const NumberInputRaw = Template.bind({});
NumberInputRaw.args = {
  placeholder: 'placeholder',
  max: 100,
  precision: 0,
  disabled: false,
  debounce: false,
};

export const NumberInputNormal = Template.bind({});
NumberInputNormal.args = {
  label: 'number input',
  placeholder: 'placeholder',
  max: 100,
  precision: 0,
  disabled: false,
  debounce: false,
};

export const NumberInputCaption = Template.bind({});
NumberInputCaption.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  precision: 0,
  disabled: false,
  debounce: false,
};

export const NumberInputError = Template.bind({});
NumberInputError.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  error: 'error here',
  max: 100,
  precision: 0,
  disabled: false,
  debounce: false,
};

export const NumberInputDisabled = Template.bind({});
NumberInputDisabled.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  precision: 0,
  disabled: true,
  debounce: false,
};
