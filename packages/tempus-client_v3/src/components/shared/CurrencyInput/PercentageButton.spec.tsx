import { fireEvent, render } from '@testing-library/react';
import PercentageButton, { PercentageButtonProps } from './PercentageButton';

const mockOnClick = jest.fn<void, [number]>();

const subject = (props: PercentageButtonProps) => render(<PercentageButton {...props} />);

describe('PercentageButton', () => {
  it('renders a percentage button', () => {
    const { getByRole, queryByText } = subject({ percentage: 50 });

    const actualButton = getByRole('button');
    const actualText = queryByText('50%');

    expect(actualButton).not.toBeNull();
    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
    expect(actualText).toMatchSnapshot();
  });

  it('renders a disabled percentage button', () => {
    const { getByRole } = subject({ percentage: 50, disabled: true });

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toBeDisabled();

    expect(actualButton).toMatchSnapshot();
  });

  it('calls `onClick` when the percentage button is clicked', () => {
    const { getByRole } = subject({ percentage: 50, onClick: mockOnClick });

    const actualButton = getByRole('button');
    fireEvent.click(actualButton);

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith(50);
  });
});
