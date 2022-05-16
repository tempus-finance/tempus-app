import { fireEvent, render } from '@testing-library/react';
import { Ticker } from 'tempus-core-services';
import CurrencySelectorItem, { CurrencySelectorItemProps } from './CurrencySelectorItem';

const defaultProps: CurrencySelectorItemProps = {
  currency: 'ETH',
};

const mockOnClick = jest.fn<void, [Ticker]>();

const subject = (props: CurrencySelectorItemProps) => render(<CurrencySelectorItem {...props} />);

describe('CurrencySelectorItem', () => {
  it('renders a currency selector item', () => {
    const { getByRole, queryByText } = subject(defaultProps);

    const actualButton = getByRole('button');
    const actualText = queryByText(defaultProps.currency);

    expect(actualButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
    expect(actualText).toMatchSnapshot();
  });

  it('renders a disabled currency selector item', () => {
    const { getByRole } = subject({ ...defaultProps, disabled: true });

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toBeDisabled();

    expect(actualButton).toMatchSnapshot();
  });

  it('calls `onClick` when the currency selector item is clicked', () => {
    const { getByRole } = subject({ ...defaultProps, onClick: mockOnClick });

    const actualButton = getByRole('button');
    fireEvent.click(actualButton);

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith(defaultProps.currency);
  });
});
