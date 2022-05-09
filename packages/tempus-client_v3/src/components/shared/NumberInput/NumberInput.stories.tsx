import { ComponentStory } from '@storybook/react';
import { FC, useCallback, useState } from 'react';
import NumberInput, { NumberInputProps } from './NumberInput';
import Typography from '../Typography';

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
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const onChange = useCallback((val: string) => setValue(val), []);
  const onDebounceChange = useCallback((val: string) => setDebouncedValue(val), []);
  return (
    <div>
      <NumberInput {...props} value={value} onChange={onChange} onDebounceChange={onDebounceChange} />
      <hr />
      <Typography variant="body-secondary">onChange: {value}</Typography>
      <Typography variant="body-secondary">onDebounceChange: {debouncedValue}</Typography>
    </div>
  );
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
  precision: 6,
  disabled: false,
  debounce: false,
};

export const NumberInputNormal = Template.bind({});
NumberInputNormal.args = {
  label: 'number input',
  placeholder: 'placeholder',
  max: 100,
  precision: 6,
  disabled: false,
  debounce: false,
};

export const NumberInputCaption = Template.bind({});
NumberInputCaption.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  precision: 6,
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
  precision: 6,
  disabled: false,
  debounce: false,
};

export const NumberInputDisabled = Template.bind({});
NumberInputDisabled.args = {
  label: 'number input',
  placeholder: 'placeholder',
  caption: 'caption here',
  max: 100,
  precision: 6,
  disabled: true,
  debounce: false,
};

export const NumberInputDebounce = Template.bind({});
NumberInputDebounce.args = {
  label: 'number debounce',
  placeholder: 'placeholder',
  max: 100,
  precision: 6,
  disabled: false,
  debounce: true,
};
