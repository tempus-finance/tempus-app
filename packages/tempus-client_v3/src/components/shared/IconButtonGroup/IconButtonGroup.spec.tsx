import { fireEvent, render } from '@testing-library/react';
import IconButtonGroup, { IconButtonGroupProps } from './IconButtonGroup';

const mockOnChange = jest.fn();

const defaultProps: IconButtonGroupProps = {
  types: ['grid-view', 'list-view'],
  onChange: mockOnChange,
};

const subject = (props: IconButtonGroupProps) => render(<IconButtonGroup {...props} />);

describe('IconButtonGroup', () => {
  it('renders a group of icon buttons', () => {
    const { container } = subject(defaultProps);

    const actualIconButtonGroup = container.querySelector('.tc__iconButtonGroup');

    expect(actualIconButtonGroup).not.toBeNull();

    expect(actualIconButtonGroup).toMatchSnapshot();
  });

  it('calls `onClick` when an icon button is clicked', () => {
    const { getAllByRole } = subject(defaultProps);

    const [firstButton, secondButton] = getAllByRole('button');

    fireEvent.click(secondButton);
    expect(mockOnChange).toHaveBeenCalledWith('list-view');

    fireEvent.click(firstButton);
    expect(mockOnChange).toHaveBeenCalledWith('grid-view');

    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });
});
