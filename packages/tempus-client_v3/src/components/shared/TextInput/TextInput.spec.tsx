import { fireEvent, render } from '@testing-library/react';
import { FC, useState } from 'react';
import { act } from 'react-dom/test-utils';
import TextInput, { TextInputProps } from './TextInput';

const mockOnChange = jest.fn();
const mockOnDebounceChange = jest.fn();

const defaultProps: TextInputProps = {
  label: 'text input label',
  value: '',
  placeholder: 'text input placeholder',
  pattern: '',
  caption: '',
  error: '',
  disabled: false,
  startAdornment: null,
  endAdornment: null,
  onChange: mockOnChange,
  onDebounceChange: mockOnDebounceChange,
};

const Wrapper: FC<TextInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  mockOnChange.mockImplementation((val: string) => setValue(val));
  return <TextInput {...props} value={value} />;
};

const subject = (props: TextInputProps) => render(<Wrapper {...props} />);

describe('TextInput', () => {
  it('renders a text input with label', () => {
    const { container, getByRole, queryByLabelText } = subject(defaultProps);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with value', () => {
    const props = { ...defaultProps, value: 'value' };
    const { container, getByRole, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input).toHaveValue(props.value);

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with pattern', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { container, getByRole, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input.getAttribute('pattern')).toBe(props.pattern);

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with caption', () => {
    const props = { ...defaultProps, caption: 'this is a caption' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with caption and error', () => {
    const props = { ...defaultProps, caption: 'this is a caption', error: 'this is an error' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);
    const error = queryByText(props.error);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).toBeNull();
    expect(error).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a disabled text input', () => {
    const props = { ...defaultProps, disabled: true };
    const { container, getByRole, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input.getAttribute('disabled')).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with startAdornment', () => {
    const props = { ...defaultProps, startAdornment: <div>startAdornment</div> };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);
    const startAdornment = queryByText('startAdornment');

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(startAdornment).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with endAdornment', () => {
    const props = { ...defaultProps, endAdornment: <div>endAdornment</div> };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);
    const endAdornment = queryByText('endAdornment');

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(endAdornment).not.toBeNull();

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with focus', () => {
    const { container, getByRole, queryByLabelText } = subject(defaultProps);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.focus(input);

    expect(textInput).toMatchSnapshot();
  });

  it('renders a text input with focus with caption', () => {
    const props = { ...defaultProps, caption: 'this is a caption' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const textInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);

    expect(textInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).not.toBeNull();

    fireEvent.focus(input);

    expect(textInput).toMatchSnapshot();
  });

  it('type text and then blur in text input with debounce will trigger onChange and onDebounceChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: undefined, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });
    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('abcd');
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.blur(input);
    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');

    jest.useRealTimers();
  });
});
