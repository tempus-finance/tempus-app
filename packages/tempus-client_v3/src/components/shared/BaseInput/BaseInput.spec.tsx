import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { FC, useState } from 'react';
import BaseInput, { BaseInputProps } from './BaseInput';

const mockOnChange = jest.fn();
const mockOnDebounceChange = jest.fn();
const mockOnBlur = jest.fn();
const mockOnFocus = jest.fn();

const defaultProps: BaseInputProps = {
  value: '',
  placeholder: 'base input placeholder',
  pattern: '',
  disabled: false,
  onChange: mockOnChange,
  onDebounceChange: mockOnDebounceChange,
  onBlur: mockOnBlur,
  onFocus: mockOnFocus,
};

const Wrapper: FC<BaseInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  mockOnChange.mockImplementation((val: string) => setValue(val));
  return <BaseInput {...props} value={value} />;
};

const subject = (props: BaseInputProps) => render(<Wrapper {...props} />);

describe('input', () => {
  beforeEach(jest.useFakeTimers);
  afterEach(jest.useRealTimers);

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
    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
    expect(input).toHaveValue('abcd');
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

  it('type text with match pattern in base input will trigger onChange and onDebounceChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).toHaveBeenCalledWith('1234');
    expect(mockOnDebounceChange).toHaveBeenCalledWith('1234');
    expect(input).toHaveValue('1234');
  });

  it('type text with unmatch pattern in base input will not trigger onChange and onDebounceChange', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).not.toHaveValue('abcd');
  });

  it('type text in base input with zero debounce will trigger onChange and onDebounceChange immediately', () => {
    const props = { ...defaultProps, debounce: 0 };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
    expect(input).toHaveValue('abcd');
  });

  it('type text in base input with debounce will trigger onDebounceChange after 300ms', () => {
    const props = { ...defaultProps, debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('abcd');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
  });

  it('type text in base input with debounce 1000 will trigger onDebounceChange after 1000ms', () => {
    const props = { ...defaultProps, debounce: 1000 };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('abcd');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDebounceChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
  });

  it('keep typing text in base input with debounce will trigger onDebounceChange after 300ms from stop typing', () => {
    const props = { ...defaultProps, debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'a' } });

    expect(mockOnChange).toHaveBeenCalledWith('a');
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('a');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    fireEvent.change(input, { target: { value: 'ab' } });

    expect(mockOnChange).toHaveBeenCalledWith('ab');
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('ab');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    fireEvent.change(input, { target: { value: 'abc' } });

    expect(mockOnChange).toHaveBeenCalledWith('abc');
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('abc');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('abcd');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
  });

  it('no type but just blur in base input with debounce will not trigger onChange or onDebounceChange', () => {
    const props = { ...defaultProps, value: 'abcd', debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.blur(input);

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
  });

  it('type text and then blur in base input with debounce will trigger onChange and onDebounceChange immediately', () => {
    const props = { ...defaultProps, value: 'ab', debounce: true };
    const { getByRole } = subject(props);

    const input = getByRole('textbox');

    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('abcd');
    expect(mockOnDebounceChange).toHaveBeenCalledWith('abcd');
    expect(input).toHaveValue('abcd');
  });
});
