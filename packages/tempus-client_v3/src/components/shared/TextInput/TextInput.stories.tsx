import { ComponentStory } from '@storybook/react';
import { FC, useCallback, useState } from 'react';
import TextInput, { TextInputProps } from './TextInput';
import Logo from '../Logo';
import Typography from '../Typography';

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

const Wrapper: FC<TextInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const onChange = useCallback((val: string) => setValue(val), []);
  const onDebounceChange = useCallback((val: string) => setDebouncedValue(val), []);
  return (
    <div>
      <TextInput {...props} value={value} onChange={onChange} onDebounceChange={onDebounceChange} />
      <hr />
      <Typography variant="body-secondary">onChange: {value}</Typography>
      <Typography variant="body-secondary">onDebounceChange: {debouncedValue}</Typography>
    </div>
  );
};

const Template: ComponentStory<typeof TextInput> = args => (
  <div style={style}>
    <Wrapper {...args} />
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
};

export const TextInputDebounce = Template.bind({});
TextInputDebounce.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  disabled: false,
  debounce: true,
  startAdornment: null,
  endAdornment: null,
};

export const TextInputWithStartAdornment = Template.bind({});
TextInputWithStartAdornment.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  disabled: false,
  debounce: false,
  startAdornment: <Logo type="token-ETH" />,
  endAdornment: null,
};

export const TextInputWithEndAdornment = Template.bind({});
TextInputWithEndAdornment.args = {
  label: 'text input',
  placeholder: 'placeholder',
  pattern: '',
  caption: 'caption here',
  disabled: false,
  debounce: false,
  startAdornment: null,
  endAdornment: <Logo type="token-ETH" />,
};
