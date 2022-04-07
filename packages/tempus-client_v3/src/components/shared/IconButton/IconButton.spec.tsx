import { fireEvent, render } from '@testing-library/react';
import IconButton, { IconButtonProps } from './IconButton';

const mockOnClick = jest.fn();

const defaultProps: IconButtonProps = {
  type: 'twitter',
  onClick: mockOnClick,
};

const subject = (props: IconButtonProps) => render(<IconButton {...props} />);

describe('IconButton', () => {
  it('renders a button with a `twitter` icon', () => {
    const { getByRole } = subject(defaultProps);

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('calls `onClick` when the button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const actualButton = getByRole('button');
    fireEvent.click(actualButton);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
