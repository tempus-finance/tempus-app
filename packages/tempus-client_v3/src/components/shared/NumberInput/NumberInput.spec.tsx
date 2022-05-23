import { fireEvent, render } from '@testing-library/react';
import { Decimal } from 'tempus-core-services';
import { FC, useState } from 'react';
import NumberInput, { NumberInputProps } from './NumberInput';
import I18nProvider from '../../../i18n/I18nProvider';

const mockOnChange = jest.fn();
const mockOnDebounceChange = jest.fn();

const defaultProps: NumberInputProps = {
  label: 'number input label',
  value: '',
  max: 100,
  precision: 18,
  placeholder: 'number input placeholder',
  caption: '',
  error: '',
  disabled: false,
  onChange: mockOnChange,
  onDebounceChange: mockOnDebounceChange,
};

const Wrapper: FC<NumberInputProps> = props => {
  const [value, setValue] = useState<string>(props.value ?? '');
  mockOnChange.mockImplementation((val: string) => setValue(val));
  return (
    <I18nProvider>
      <NumberInput {...props} value={value} />
    </I18nProvider>
  );
};

const subject = (props: NumberInputProps) => render(<Wrapper {...props} />);

describe('NumberInput', () => {
  it('renders a number input with label, value and caption', () => {
    const props = { ...defaultProps, value: 'value', caption: 'this is a caption' };
    const { container, getByRole, queryByText, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__number-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);
    const caption = queryByText(props.caption);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input).toHaveValue(props.value);
    expect(caption).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
  });

  it('renders a disabled number input', () => {
    const props = { ...defaultProps, disabled: true };
    const { container, getByRole, queryByLabelText } = subject(props);

    const numberInput = container.querySelector('.tc__number-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(numberInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();
    expect(input).toBeDisabled();

    expect(numberInput).toMatchSnapshot();
  });

  it('click max button in number input will trigger onChange and onDebounceChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
    expect(mockOnDebounceChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
  });

  it('click max button in number input with max as string will trigger onChange and onDebounceChange', () => {
    const props = { ...defaultProps, max: '100' };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
    expect(mockOnDebounceChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
  });

  it('click max button in number input with max as Decimal will trigger onChange and onDebounceChange', () => {
    const props = { ...defaultProps, max: new Decimal(100) };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
    expect(mockOnDebounceChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
  });

  it('click max button in number input with precision 0 will show integer value of max', () => {
    const props = { ...defaultProps, precision: 0 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(new Decimal(defaultProps.max).toTruncated());
    expect(mockOnDebounceChange).toHaveBeenCalledWith(new Decimal(defaultProps.max).toTruncated());
  });

  it('click max button in number input without providing precision will use default precision', () => {
    const props = { ...defaultProps, precision: undefined };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(new Decimal(new Decimal(defaultProps.max).toTruncated(18)).toString());
    expect(mockOnDebounceChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(18)).toString(),
    );
  });

  it('click max button in number input with different precision will trigger onChange and onDebounceChange', () => {
    const props = { ...defaultProps, precision: 10 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
    expect(mockOnDebounceChange).toHaveBeenCalledWith(
      new Decimal(new Decimal(defaultProps.max).toTruncated(defaultProps.precision)).toString(),
    );
  });

  it('type text with unmatch pattern in number input will not trigger onChange and onDebounceChange', () => {
    const { getByRole, queryByLabelText } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.change(input, { target: { value: 'abcd' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnDebounceChange).not.toHaveBeenCalled();
  });
});
