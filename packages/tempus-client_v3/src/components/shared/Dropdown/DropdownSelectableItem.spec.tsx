import { fireEvent, render } from '@testing-library/react';
import DropdownSelectableItem, { DropdownSelectableItemProps } from './DropdownSelectableItem';
import DropdownSelectableItemIcon from './DropdownSelectableItemIcon';

const defaultProps: DropdownSelectableItemProps = {
  label: 'Item',
  value: 'item',
};

const mockOnClick = jest.fn<void, [string]>();

const defaultSubject = (props: DropdownSelectableItemProps) => render(<DropdownSelectableItem {...props} />);

const defaultSubjectWithIcons = (props: DropdownSelectableItemProps) =>
  render(
    <DropdownSelectableItem {...props}>
      <DropdownSelectableItemIcon icon="up-arrow-thin" value="up" />
      <DropdownSelectableItemIcon icon="down-arrow-thin" value="down" />
    </DropdownSelectableItem>,
  );

const defaultSubjectWithIconsNoValues = (props: DropdownSelectableItemProps) =>
  render(
    <DropdownSelectableItem {...props}>
      <DropdownSelectableItemIcon icon="up-arrow-thin" />
      <DropdownSelectableItemIcon icon="down-arrow-thin" />
    </DropdownSelectableItem>,
  );

describe('DropdownSelectableItem', () => {
  it('renders a selectable dropdown item', () => {
    const { getByRole } = defaultSubject(defaultProps);

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toMatchSnapshot();
  });

  it('renders a selectable dropdown item with icons', () => {
    const { container, getByRole } = defaultSubjectWithIcons(defaultProps);

    const actualButton = getByRole('button');
    const upIcon = container.querySelector('.tc__icon');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toMatchSnapshot();

    expect(upIcon).not.toBeNull();
    expect(upIcon).toMatchSnapshot();
  });

  it('changes the icon on click', () => {
    const { container, getByRole } = defaultSubjectWithIcons({
      ...defaultProps,
      selectedValue: 'up',
      onClick: mockOnClick,
    });

    const actualButton = getByRole('button');
    let upIcon = container.querySelector('.tc__icon-up-arrow-thin');
    let downIcon = container.querySelector('.tc__icon-down-arrow-thin');

    expect(actualButton).not.toBeNull();

    expect(upIcon).not.toBeNull();
    expect(upIcon).toMatchSnapshot();

    expect(downIcon).toBeNull();

    fireEvent.click(actualButton);

    upIcon = container.querySelector('.tc__icon-up-arrow-thin');
    downIcon = container.querySelector('.tc__icon-down-arrow-thin');

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith('down');

    expect(upIcon).toBeNull();

    expect(downIcon).not.toBeNull();
    expect(downIcon).toMatchSnapshot();
  });

  it('does not change the icon on click if the item was not selected', () => {
    const { container, getByRole } = defaultSubjectWithIcons({
      ...defaultProps,
      selectedValue: 'something', // different then 'up' or 'down'
      onClick: mockOnClick,
    });

    const actualButton = getByRole('button');
    let upIcon = container.querySelector('.tc__icon-up-arrow-thin');
    let downIcon = container.querySelector('.tc__icon-down-arrow-thin');

    expect(actualButton).not.toBeNull();

    expect(upIcon).not.toBeNull();
    expect(upIcon).toMatchSnapshot();

    expect(downIcon).toBeNull();

    fireEvent.click(actualButton);

    upIcon = container.querySelector('.tc__icon-up-arrow-thin');
    downIcon = container.querySelector('.tc__icon-down-arrow-thin');

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith('up');

    expect(upIcon).not.toBeNull();
    expect(upIcon).toMatchSnapshot();

    expect(downIcon).toBeNull();
  });

  it('uses its value when `onClick` if the selected child does not have a value', () => {
    const { getByRole } = defaultSubjectWithIconsNoValues({
      ...defaultProps,
      selectedValue: 'something',
      onClick: mockOnClick,
    });

    const actualButton = getByRole('button');

    fireEvent.click(actualButton);

    expect(mockOnClick).toBeCalledTimes(1);
    expect(mockOnClick).toBeCalledWith('item');
  });
});
