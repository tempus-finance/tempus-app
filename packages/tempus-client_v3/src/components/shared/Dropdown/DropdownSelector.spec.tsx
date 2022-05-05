import { fireEvent, render } from '@testing-library/react';
import DropdownSelectableItem from './DropdownSelectableItem';
import DropdownSelector, { DropdownSelectorProps } from './DropdownSelector';

const mockOnSelect = jest.fn<void, any>();

const defaultProps: DropdownSelectorProps<any> = {
  label: 'Selector',
  selectedValue: 'one',
};

const subject = (props: DropdownSelectorProps<any>) =>
  render(
    <DropdownSelector {...props}>
      <DropdownSelectableItem label="One" value="one" />
      <DropdownSelectableItem label="Two" value="two" />
    </DropdownSelector>,
  );

describe('DropdownSelector', () => {
  it('renders a dropdown selector', () => {
    const { getByRole } = subject(defaultProps);

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toMatchSnapshot();
  });

  it('renders a dropdown selector without children', () => {
    const { getByRole } = render(<DropdownSelector {...defaultProps} />);

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();
    expect(actualButton).toMatchSnapshot();
  });

  it('opens dropdown with selections and updates selection on click', () => {
    const { container, getByRole } = subject({ ...defaultProps, onSelect: mockOnSelect });

    const actualButton = getByRole('button');

    expect(actualButton).not.toBeNull();

    fireEvent.click(actualButton);

    const dropdownPopup = container.querySelector('.tc__dropdown__popup');

    expect(dropdownPopup).not.toBeNull();
    expect(dropdownPopup).toMatchSnapshot();

    const secondOptionButton = container.querySelector('.tc__dropdownItem__selectable:last-child > button') as Element;

    expect(secondOptionButton).not.toBeNull();

    fireEvent.click(secondOptionButton);

    expect(mockOnSelect).toBeCalledTimes(1);
    expect(mockOnSelect).toBeCalledWith('two');
  });
});
