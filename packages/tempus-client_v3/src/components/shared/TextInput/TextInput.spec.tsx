import { fireEvent, render } from '@testing-library/react';
import TextInput, { TextInputProps } from './TextInput';

const mockOnChange = jest.fn();

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
};

const subject = (props: TextInputProps) => render(<TextInput {...props} />);

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

  it('type text in text input will trigger onChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
  });

  it('type text with match pattern in text input will trigger onChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('type text with unmatch pattern in text input will not trigger onChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('type text in text input with zero debounce will trigger onChange immediately', () => {
    const props = { ...defaultProps, debounce: 0 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
  });

  it('type text in text input with debounce will trigger onChange after 300ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('type text in text input with debounce 1000 will trigger onChange after 1000ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: 1000 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(700);
    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('keep typing text in text input with debounce will trigger onChange after 300ms from stop typing', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'a' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: 'ab' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: 'abc' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('blur in text input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: 'abcd', debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('type text and then blur in text input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: undefined, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });
    jest.advanceTimersByTime(100);
    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });
});
