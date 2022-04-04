import { fireEvent, render } from '@testing-library/react';
import Radio, { RadioProps } from './Radio';

const mockOnChange = jest.fn();

const subject = (props: RadioProps) => render(<Radio {...props}>My Button</Radio>);

describe('Radio', () => {
  it('renders an unchecked radio button without a label', () => {
    const { getByRole } = subject({ checked: false });

    const radioButton = getByRole('radio');

    expect(radioButton).not.toBeNull();
    expect(radioButton).not.toBeChecked();
  });

  it('renders a checked radio button with a label', () => {
    const { getByRole, getByText } = subject({ checked: true, label: 'option 1' });

    const radioButton = getByRole('radio');
    const label = getByText('option 1');

    expect(radioButton).not.toBeNull();
    expect(radioButton).toBeChecked();

    expect(label).not.toBeNull();
    expect(label).toMatchSnapshot();
  });

  it('calls `onChange` when the radio button is clicked', () => {
    const { getByRole } = subject({ checked: false, onChange: mockOnChange });

    const radioButton = getByRole('radio');
    fireEvent.click(radioButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
