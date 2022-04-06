import { fireEvent, render } from '@testing-library/react';
import DropdownItem, { DropdownItemProps } from './DropdownItem';

const mockOnChangeHandler = jest.fn();

const defaultProps: DropdownItemProps = {
  label: 'Dropdown Item',
  onChange: mockOnChangeHandler,
  checkbox: true,
  icon: 'up-arrow-thin',
};

const subject = (props: DropdownItemProps) => render(<DropdownItem {...props} />);

describe('DropdownItem', () => {
  it('renders with provided label', () => {
    const { getByText } = subject(defaultProps);

    const result = getByText(defaultProps.label);

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });

  it('renders a checkbox when checkbox prop is provided', () => {
    const { getByRole } = subject(defaultProps);

    const result = getByRole('checkbox');

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });

  it('renders an icon when provided', () => {
    const { container } = subject(defaultProps);

    const iconSvg = container.querySelector('svg');

    expect(iconSvg).not.toBeNull();
    expect(iconSvg).toHaveClass(`tc__icon-${defaultProps.icon}`);
    expect(iconSvg).toMatchSnapshot();
  });

  it('does not render a checkbox when not checkbox is not provided', () => {
    const { queryByRole } = subject({
      label: 'Simple label',
      onChange: mockOnChangeHandler,
    });

    const result = queryByRole('checkbox');

    expect(result).toBeNull();
    expect(result).toMatchSnapshot();
  });

  it('does not render an icon when icon is not provided', () => {
    const { container } = subject({
      label: 'Simple label',
      onChange: mockOnChangeHandler,
    });

    const iconSvg = container.querySelector('svg');

    expect(iconSvg).toBeNull();
    expect(iconSvg).toMatchSnapshot();
  });

  it('calls onChange handler when checkbox is toggled', () => {
    const { getByRole } = subject(defaultProps);

    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnChangeHandler).toHaveBeenCalledTimes(1);
    expect(mockOnChangeHandler).toHaveBeenCalledWith(true, defaultProps.label);

    fireEvent.click(checkbox);
    expect(mockOnChangeHandler).toHaveBeenCalledTimes(2);
    expect(mockOnChangeHandler).toHaveBeenCalledWith(false, defaultProps.label);

    expect(checkbox).toMatchSnapshot();
  });
});