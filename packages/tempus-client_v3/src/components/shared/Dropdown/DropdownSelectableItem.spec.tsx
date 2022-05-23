import { fireEvent, render } from '@testing-library/react';
import DropdownSelectableItem, { DropdownSelectableItemProps } from './DropdownSelectableItem';

const defaultProps: DropdownSelectableItemProps<string> = {
  label: 'Item',
  value: 'item',
};

const mockOnClick = jest.fn<void, [string]>();

const subject = (props: DropdownSelectableItemProps<string>) => render(<DropdownSelectableItem {...props} />);

describe('DropdownSelectableItem', () => {
  it('renders a selectable dropdown item', () => {
    const { getByRole } = subject(defaultProps);

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toMatchSnapshot();
  });

  it('renders a selectable dropdown item with icon', () => {
    const { container, getByRole } = subject({
      ...defaultProps,
      selected: true,
      iconType: 'up-arrow-thin',
    });

    const actualButton = getByRole('button');
    const upIcon = container.querySelector('.tc__icon-up-arrow-thin');

    expect(actualButton).not.toBeNull();

    expect(upIcon).not.toBeNull();
    expect(upIcon).toMatchSnapshot();
  });

  it('calls `onClick` when the item is clicked', () => {
    const { getByRole } = subject({
      ...defaultProps,
      onClick: mockOnClick,
    });

    const actualButton = getByRole('button');

    fireEvent.click(actualButton);

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith('item');
  });
});
