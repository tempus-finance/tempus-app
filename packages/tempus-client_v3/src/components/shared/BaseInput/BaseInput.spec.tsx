import { fireEvent, render } from '@testing-library/react';
import BaseInput, { BaseInputProps } from './BaseInput';

const mockOnChange = jest.fn();
const mockOnBlur = jest.fn();
const mockOnFocus = jest.fn();

const defaultProps: BaseInputProps = {
  value: '',
  placeholder: 'base input placeholder',
  pattern: '',
  disabled: false,
  onChange: mockOnChange,
  onBlur: mockOnBlur,
  onFocus: mockOnFocus,
};

const subject = (props: BaseInputProps) => render(<BaseInput {...props} />);

describe('input', () => {
  it('renders a base input with value', () => {
    const props = { ...defaultProps, value: 'value' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();
    expect(input).toHaveValue(props.value);

    expect(input).toMatchSnapshot();
  });

  it('renders a base input with pattern', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();
    expect(input).not.toBeNull();
    expect(input.getAttribute('pattern')).toBe(props.pattern);

    expect(input).toMatchSnapshot();
  });

  it('renders a disabled base input', () => {
    const props = { ...defaultProps, disabled: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();
    expect(input).not.toBeNull();
    expect(input.getAttribute('disabled')).not.toBeNull();

    expect(input).toMatchSnapshot();
  });

  it('type text in base input will trigger onChange', () => {
    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
  });

  it('focus in base input will trigger onFocus', () => {
    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.focus(input);

    expect(mockOnFocus).toHaveBeenCalled();
  });

  it('focus in base input will trigger onBlur', () => {
    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.blur(input);

    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('type text with match pattern in base input will trigger onChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('type text with unmatch pattern in base input will not trigger onChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('type text in base input with zero debounce will trigger onChange immediately', () => {
    const props = { ...defaultProps, debounce: 0 };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
  });

  it('type text in base input with debounce will trigger onChange after 300ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('type text in base input with debounce 1000 will trigger onChange after 1000ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: 1000 };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(700);
    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('keep typing text in base input with debounce will trigger onChange after 300ms from stop typing', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

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

  it('blur in base input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: 'abcd', debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('type text and then blur in base input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: undefined, debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });
    jest.advanceTimersByTime(100);
    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });
});
