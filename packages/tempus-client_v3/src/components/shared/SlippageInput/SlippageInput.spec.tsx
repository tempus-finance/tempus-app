import { act, fireEvent, render } from '@testing-library/react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { FC, useState } from 'react';
import SlippageInput, { SlippageInputProps } from './SlippageInput';

const mockOnPercentageUpdate = jest.fn();
const mockOnAutoUpdate = jest.fn();

const defaultProps: SlippageInputProps = {
  percentage: new Decimal(0.02),
  isAuto: false,
  error: undefined,
  disabled: false,
  onPercentageUpdate: mockOnPercentageUpdate,
  onAutoUpdate: mockOnAutoUpdate,
};

const Wrapper: FC<SlippageInputProps> = props => {
  const [percentage, setPercentage] = useState<Decimal>(props.percentage ?? new Decimal(0));
  const [isAuto, setIsAuto] = useState<boolean>(props.isAuto ?? false);
  mockOnPercentageUpdate.mockImplementation((val: Decimal) => setPercentage(val));
  mockOnAutoUpdate.mockImplementation((val: boolean) => setIsAuto(val));
  return <SlippageInput {...props} percentage={percentage} isAuto={isAuto} />;
};

const subject = (props: SlippageInputProps) => render(<Wrapper {...props} />);

describe('SlippageInput', () => {
  it('renders a slippage input', () => {
    const { container, getByRole } = subject(defaultProps);

    const slippageInput = container.querySelector('.tc__slippage-input');
    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(slippageInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(input).toHaveAttribute('placeholder', DecimalUtils.formatPercentage(defaultProps.percentage, 2));

    expect(slippageInput).toMatchSnapshot();
  });

  it('renders a slippage input set to auto', () => {
    const props = { ...defaultProps, isAuto: true };
    const { container, getByRole } = subject(props);

    const slippageInput = container.querySelector('.tc__slippage-input');
    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(slippageInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(button.getAttribute('data-selected')).toEqual('true');
    expect(input).toHaveAttribute('placeholder', DecimalUtils.formatPercentage(props.percentage, 2));

    expect(slippageInput).toMatchSnapshot();
  });

  it('renders a disabled slippage input', () => {
    const props = { ...defaultProps, disabled: true };
    const { container, getByRole } = subject(props);

    const slippageInput = container.querySelector('.tc__slippage-input');
    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(slippageInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(input).toHaveAttribute('placeholder', DecimalUtils.formatPercentage(props.percentage, 2));
    expect(input.getAttribute('disabled')).not.toBeNull();

    expect(slippageInput).toMatchSnapshot();
  });

  it('renders a slippage input with error', () => {
    const props = { ...defaultProps, error: 'cannot exceed 100%' };
    const { container, getByRole, queryByText } = subject(props);

    const slippageInput = container.querySelector('.tc__slippage-input');
    const input = getByRole('textbox');
    const button = getByRole('button');
    const error = queryByText(props.error);

    expect(slippageInput).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();
    expect(error).not.toBeNull();
    expect(input).toHaveAttribute('placeholder', DecimalUtils.formatPercentage(props.percentage, 2));

    expect(slippageInput).toMatchSnapshot();
  });

  it('typing in slippage input will trigger onPercentageUpdate() and call onAutoUpdate(false) with debounce', () => {
    jest.useFakeTimers();

    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2.5' } });

    expect(mockOnPercentageUpdate).not.toHaveBeenCalled();
    expect(mockOnAutoUpdate).not.toHaveBeenCalled();
    expect(input).toHaveValue('2.5');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnPercentageUpdate).toHaveBeenCalledWith(new Decimal(0.025));
    expect(mockOnAutoUpdate).toHaveBeenCalledWith(false);

    jest.useRealTimers();
  });

  it('type "." in slippage input will set slippage to zero', () => {
    jest.useFakeTimers();

    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '.' } });

    expect(mockOnPercentageUpdate).not.toHaveBeenCalled();
    expect(mockOnAutoUpdate).not.toHaveBeenCalled();
    expect(input).toHaveValue('.');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnPercentageUpdate).toHaveBeenCalledWith(new Decimal(0));
    expect(mockOnAutoUpdate).toHaveBeenCalledWith(false);

    jest.useRealTimers();
  });

  it('click auto button in slippage input will call onAutoUpdate(true)', () => {
    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    fireEvent.click(button);

    expect(mockOnPercentageUpdate).not.toHaveBeenCalled();
    expect(mockOnAutoUpdate).toHaveBeenCalledWith(true);
  });

  it('type and then set Auto, will call onPercentageUpdate() and onAutoUpdate(true)', () => {
    jest.useFakeTimers();

    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    fireEvent.change(input, { target: { value: '2.5' } });
    fireEvent.click(button);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnPercentageUpdate).toHaveBeenCalledWith(new Decimal(0.025));
    expect(mockOnAutoUpdate).toHaveBeenCalledWith(true);

    jest.useRealTimers();
  });

  it('type and then set Auto and then go back to type, will call onPercentageUpdate() and onAutoUpdate(false)', () => {
    jest.useFakeTimers();

    const { getByRole } = subject(defaultProps);

    const input = getByRole('textbox');
    const button = getByRole('button');

    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2.5' } });
    fireEvent.blur(input);
    fireEvent.click(button);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.blur(input);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnPercentageUpdate).toHaveBeenCalledWith(new Decimal(0.015));
    expect(mockOnAutoUpdate).toHaveBeenCalledWith(false);

    jest.useRealTimers();
  });
});
