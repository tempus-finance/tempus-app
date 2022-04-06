import { fireEvent, render } from '@testing-library/react';
import ToggleSwitch, { ToggleSwitchProps } from './ToggleSwitch';

const mockOnChange = jest.fn();

const defaultProps: ToggleSwitchProps = {
  checked: false,
  label: 'my label',
  onChange: mockOnChange,
};

const subject = (props: ToggleSwitchProps) => render(<ToggleSwitch {...props} />);

describe('ToggleSwitch', () => {
  it('renders an unchecked toggle switch', () => {
    const { container, queryByText, getByRole } = subject(defaultProps);

    const actualToggleSwitch = container.querySelector('.tc__toggle-switch');
    const actualLabel = queryByText('my label');
    const actualCheckbox = getByRole('checkbox');

    expect(actualToggleSwitch).not.toBeNull();
    expect(actualLabel).not.toBeNull();

    expect(actualCheckbox).not.toBeNull();
    expect(actualCheckbox).not.toBeChecked();

    expect(actualToggleSwitch).toMatchSnapshot();
  });

  it('renders a checked toggle switch', () => {
    const { container, queryByText, getByRole } = subject({ ...defaultProps, checked: true });

    const actualToggleSwitch = container.querySelector('.tc__toggle-switch');
    const actualLabel = queryByText('my label');
    const actualCheckbox = getByRole('checkbox');

    expect(actualToggleSwitch).not.toBeNull();
    expect(actualLabel).not.toBeNull();

    expect(actualCheckbox).not.toBeNull();
    expect(actualCheckbox).toBeChecked();

    expect(actualToggleSwitch).toMatchSnapshot();
  });

  it('calls `onChange` when the toggle switch button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const actualCheckbox = getByRole('checkbox');
    fireEvent.click(actualCheckbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
