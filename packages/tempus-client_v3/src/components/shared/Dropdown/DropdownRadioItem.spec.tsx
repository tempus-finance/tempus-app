import { fireEvent, render } from '@testing-library/react';
import { FC, useState } from 'react';
import DropdownRadioItem, { DropdownRadioItemProps } from './DropdownRadioItem';

const mockOnChangeHandler = jest.fn();

const defaultProps: DropdownRadioItemProps<string> = {
  label: 'Dropdown Item',
  value: 'abcd',
  onChange: mockOnChangeHandler,
  icon: 'up-arrow-thin',
};

const Wrapper: FC<DropdownRadioItemProps<string>> = props => {
  const [value, setValue] = useState<string>('');
  mockOnChangeHandler.mockImplementation(setValue);
  return <DropdownRadioItem {...props} checked={value === 'abcd'} />;
};

const subject = (props: DropdownRadioItemProps<string>) => render(<Wrapper {...props} />);

describe('DropdownRadioItem', () => {
  it('renders with provided label', () => {
    const { getByText } = subject(defaultProps);

    const result = getByText(defaultProps.label);

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });

  it('renders a radio when radio prop is provided', () => {
    const { getByRole } = subject(defaultProps);

    const result = getByRole('radio');

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

  it('does not render an icon when icon is not provided', () => {
    const props = {
      label: 'Simple label',
      value: 'aaaa',
      onChange: mockOnChangeHandler,
    };
    const { container } = render(<DropdownRadioItem {...props} />);

    const iconSvg = container.querySelector('svg');

    expect(iconSvg).toBeNull();
    expect(iconSvg).toMatchSnapshot();
  });

  it('calls onChange handler when radio is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const checkbox = getByRole('radio');
    fireEvent.click(checkbox);

    expect(mockOnChangeHandler).toHaveBeenCalledTimes(1);
    expect(mockOnChangeHandler).toHaveBeenCalledWith(defaultProps.value);

    expect(checkbox).toMatchSnapshot();
  });
});
