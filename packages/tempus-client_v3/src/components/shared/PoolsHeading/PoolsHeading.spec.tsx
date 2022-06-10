import { fireEvent, render } from '@testing-library/react';
import PoolsHeading, { PoolsHeadingProps } from './PoolsHeading';

const mockOnBackButtonClick = jest.fn();

const defaultProps: PoolsHeadingProps = {
  text: 'Ethereum-network pools',
};

const subject = (props: PoolsHeadingProps) => render(<PoolsHeading {...props} />);

describe('PoolsHeading', () => {
  it('renders a heading label with provided text', () => {
    const { container, getByText } = subject(defaultProps);

    const actualText = getByText('Ethereum-network pools');

    expect(actualText).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a heading label with provided text and back button', () => {
    const { container, getByText, getByRole } = subject({ ...defaultProps, onBackButtonClick: mockOnBackButtonClick });

    const actualText = getByText('Ethereum-network pools');
    const actualBackButton = getByRole('button');

    expect(actualText).not.toBeNull();
    expect(actualBackButton).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('calls `onBackButtonClick` when the back button is clicked', () => {
    const { getByRole } = subject({ ...defaultProps, onBackButtonClick: mockOnBackButtonClick });

    const actualBackButton = getByRole('button');

    expect(actualBackButton).not.toBeNull();

    fireEvent.click(actualBackButton);

    expect(mockOnBackButtonClick).toHaveBeenCalledTimes(1);
    expect(actualBackButton).toMatchSnapshot();
  });
});
