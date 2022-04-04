import { fireEvent, render } from '@testing-library/react';
import Checkbox, { CheckboxProps } from './Checkbox';

const mockOnChange = jest.fn();

const defaultProps: CheckboxProps = {
  checked: false,
  label: 'myCheckbox',
  onChange: mockOnChange,
};

const subject = (props: CheckboxProps) => render(<Checkbox {...props} />);

describe('Checkbox', () => {
  it('renders an unchecked checkbox', () => {
    const { queryByText, getByRole } = subject(defaultProps);

    const actualText = queryByText('myCheckbox');
    const actualCheckbox = getByRole('checkbox');

    expect(actualText).not.toBeNull();
    expect(actualCheckbox).not.toBeNull();
    expect(actualCheckbox).not.toBeChecked();

    expect(actualCheckbox).toMatchSnapshot();
  });

  it('renders an checked checkbox', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, checked: true });

    const actualText = queryByText('myCheckbox');
    const actualCheckbox = getByRole('checkbox');

    expect(actualText).not.toBeNull();
    expect(actualCheckbox).not.toBeNull();
    expect(actualCheckbox).toBeChecked();

    expect(actualCheckbox).toMatchSnapshot();
  });

  it('calls `onChange` when the checkbox is clicked', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps });

    const actualText = queryByText('myCheckbox');
    const actualCheckbox = getByRole('checkbox');

    expect(actualText).not.toBeNull();
    expect(actualCheckbox).not.toBeNull();
    expect(actualCheckbox).not.toBeChecked();

    fireEvent.click(actualCheckbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
