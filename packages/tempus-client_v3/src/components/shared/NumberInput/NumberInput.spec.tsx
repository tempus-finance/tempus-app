import { fireEvent, render } from '@testing-library/react';
import { BigNumber, utils } from 'ethers';
import NumberInput, { NumberInputProps } from './NumberInput';

const mockOnChange = jest.fn();

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
};

const subject = (props: NumberInputProps) => render(<NumberInput {...props} />);

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
    expect(input.getAttribute('disabled')).not.toBeNull();

    expect(numberInput).toMatchSnapshot();
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

    expect(mockOnChange).toHaveBeenCalledWith(utils.formatUnits(defaultProps.max, defaultProps.precision));
  });

  it('click max button in number input with max as string will trigger onChange', () => {
    const props = { ...defaultProps, max: '100' };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(utils.formatUnits(defaultProps.max, props.precision));
  });

  it('click max button in number input with max as BigNumber will trigger onChange', () => {
    const props = { ...defaultProps, max: BigNumber.from(100) };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(utils.formatUnits(defaultProps.max, props.precision));
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

    expect(mockOnChange).toHaveBeenCalledWith(utils.formatUnits(defaultProps.max, 18));
  });

  it('click max button in number input with different precision will trigger onChange', () => {
    const props = { ...defaultProps, precision: 10 };
    const { getByRole, queryByLabelText } = subject(props);

    const input = getByRole('textbox');
    const button = getByRole('button');
    const label = queryByLabelText(defaultProps.label as string);

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(label).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(utils.formatUnits(defaultProps.max, props.precision));
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
});
