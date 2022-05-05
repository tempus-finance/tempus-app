import { render } from '@testing-library/react';
import CurrencyInputModalInfoRow, { CurrencyInputModalInfoRowProps } from './CurrencyInputModalInfoRow';

const subject = (props: CurrencyInputModalInfoRowProps) => render(<CurrencyInputModalInfoRow {...props} />);

const defaultProps: CurrencyInputModalInfoRowProps = {
  label: 'Amount',
  value: '1.2345',
  currency: 'ETH',
};

describe('CurrencyInputModalInfoRow', () => {
  it('renders an info row for a modal with currency input', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders an info row with an up arrow for a modal with currency input', () => {
    const { container } = subject({ ...defaultProps, valueChange: 'increase' });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders an info row with a down arrow for a modal with currency input', () => {
    const { container } = subject({ ...defaultProps, valueChange: 'decrease' });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
