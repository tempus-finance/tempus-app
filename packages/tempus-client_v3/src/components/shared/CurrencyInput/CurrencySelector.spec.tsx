import { fireEvent, getAllByRole, render } from '@testing-library/react';
import { Ticker } from 'tempus-core-services';
import CurrencySelector, { CurrencySelectorProps } from './CurrencySelector';

const defaultProps = {
  currencies: ['ETH', 'stETH'],
};

const mockOnChange = jest.fn<void, [Ticker]>();

const subject = (props: CurrencySelectorProps) => render(<CurrencySelector {...props} />);

describe('CurrencySelector', () => {
  it('renders a currency selector', () => {
    const { getByRole, queryByText } = subject(defaultProps);

    const actualButton = getByRole('button');
    const actualText = queryByText(defaultProps.currencies[0]);

    expect(actualButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
    expect(actualText).toMatchSnapshot();
  });

  it('renders a disabled currency selector', () => {
    const { getByRole } = subject({ ...defaultProps, disabled: true });

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toBeDisabled();

    expect(actualButton).toMatchSnapshot();
  });

  it('opens a currency selector with multiple currencies', () => {
    const { getAllByRole, getByRole, queryAllByRole, queryAllByText, queryByText } = subject({
      ...defaultProps,
      onChange: mockOnChange,
    });

    let actualEthButtons = getAllByRole('button', { name: defaultProps.currencies[0] });

    expect(actualEthButtons).not.toBeNull();
    expect(actualEthButtons).toHaveLength(1);

    fireEvent.click(actualEthButtons[0]);

    actualEthButtons = getAllByRole('button', { name: defaultProps.currencies[0] });
    const actualEthTexts = queryAllByText(defaultProps.currencies[0]);
    const availableStEthButton = getByRole('button', { name: defaultProps.currencies[1] });
    const availableStETHText = queryByText(defaultProps.currencies[1]);

    expect(actualEthButtons).not.toBeNull();
    expect(actualEthButtons).toHaveLength(2);

    expect(actualEthTexts).not.toBeNull();
    expect(actualEthTexts).toHaveLength(2);

    expect(availableStEthButton).not.toBeNull();

    expect(availableStETHText).not.toBeNull();

    // Change to the second currency
    fireEvent.click(availableStEthButton);

    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toBeCalledWith(defaultProps.currencies[1]);

    const unavailableEthButtons = queryAllByRole('button', { name: defaultProps.currencies[0] });
    const unavailableEthText = queryByText(defaultProps.currencies[0]);
    const actualStEthButton = getByRole('button', { name: defaultProps.currencies[1] });
    const actualStEthText = queryByText(defaultProps.currencies[1]);

    expect(unavailableEthButtons).toHaveLength(0);
    expect(unavailableEthText).toBeNull();

    expect(actualStEthButton).not.toBeNull();
    expect(actualStEthText).not.toBeNull();
  });

  it('does not call `onChange` when the same currency is selected', () => {
    const { container, getByRole } = subject({
      ...defaultProps,
      onChange: mockOnChange,
    });

    const actualSelectorButton = getByRole('button');

    expect(actualSelectorButton).not.toBeNull();

    fireEvent.click(actualSelectorButton);

    const dropdownEthButton = container.querySelector(
      '.tc__currency-input__currency-selector-dropdown button:first-of-type',
    );

    expect(dropdownEthButton).not.toBeNull();

    fireEvent.click(dropdownEthButton);

    expect(mockOnChange).not.toBeCalled();
  });
});
