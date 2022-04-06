import { fireEvent, render } from '@testing-library/react';
import NumberInput, { NumberInputProps } from './NumberInput';

const mockOnChange = jest.fn();

const defaultProps: NumberInputProps = {
  label: 'number input label',
  value: '',
  max: 100,
  placeholder: 'number input placeholder',
  caption: '',
  error: '',
  disabled: false,
  onChange: mockOnChange,
};

const subject = (props: NumberInputProps) => render(<NumberInput {...props} />);

describe('NumberInput', () => {
  it('renders a number input with label', () => {
    const { container, getByRole, queryByLabelText } = subject(defaultProps);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with value', () => {
    const props = { ...defaultProps, value: 'value' };
    const { container, getByRole, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input).toHaveValue(props.value);

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with pattern', () => {
    const props = { ...defaultProps, pattern: '[0-9,]*[.]?[0-9]*' };
    const { container, getByRole, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input.getAttribute('pattern')).toBe(props.pattern);

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with caption', () => {
    const props = { ...defaultProps, caption: 'this is a caption' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with caption and error', () => {
    const props = { ...defaultProps, caption: 'this is a caption', error: 'this is an error' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);
    const error = queryByText(props.error);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).toBeNull();
    expect(error).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a disabled number input', () => {
    const props = { ...defaultProps, disabled: true };
    const { container, getByRole, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input.getAttribute('disabled')).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with focus', () => {
    const { container, getByRole, queryByLabelText } = subject(defaultProps);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.focus(input);

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a number input with focus with caption', () => {
    const props = { ...defaultProps, caption: 'this is a caption' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__text-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(caption).not.toBeNull();

    fireEvent.focus(input);

    expect(numberInput).toMatchSnapshot();
  });

  it('type text in number input will trigger onChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('click max button in number input will trigger onChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(`${defaultProps.max}`);
  });

  it('type text with unmatch pattern in number input will not trigger onChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('type text in number input with zero debounce will trigger onChange immediately', () => {
    const props = { ...defaultProps, debounce: 0 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('type text in number input with debounce will trigger onChange after 300ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).toHaveBeenCalledWith('1234');
    jest.useRealTimers();
  });

  it('type text in number input with debounce 1000 will trigger onChange after 1000ms', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: 1000 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(700);
    expect(mockOnChange).toHaveBeenCalledWith('1234');
    jest.useRealTimers();
  });

  it('keep typing text in number input with debounce will trigger onChange after 300ms from stop typing', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: '12' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: '123' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: '1234' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);

    expect(mockOnChange).toHaveBeenCalledWith('1234');
    jest.useRealTimers();
  });

  it('blur in number input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: '1234', debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('1234');
    jest.useRealTimers();
  });

  it('type text and then blur in number input with debounce will trigger onChange immediately', () => {
    jest.useFakeTimers();
    const props = { ...defaultProps, value: undefined, debounce: true };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: '1234' } });
    jest.advanceTimersByTime(100);
    fireEvent.blur(input);

    expect(mockOnChange).toHaveBeenCalledWith('1234');
    jest.useRealTimers();
  });
});
