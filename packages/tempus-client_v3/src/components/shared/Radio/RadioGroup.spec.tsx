import { render } from '@testing-library/react';
import Radio from './Radio';
import RadioGroup, { RadioGroupProps } from './RadioGroup';

const subject = (props: Partial<RadioGroupProps>) =>
  render(
    <RadioGroup {...props}>
      <Radio value="item1" label="Item #1" />
      <Radio value="item2" label="Item #2" />
      <Radio value="item3" label="Item #3" />
    </RadioGroup>,
  );

describe('RadioGroup', () => {
  it('renders three radio buttons with labels', () => {
    const { getAllByRole, getAllByText } = subject({ value: 'item3' });

    const radioButtons = getAllByRole('radio');
    const labels = getAllByText(/Item #\d/);

    expect(radioButtons).not.toBeNull();
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked();

    expect(labels).not.toBeNull();
    expect(labels).toHaveLength(3);

    labels.forEach((label, index) => expect(label).toHaveTextContent(`Item #${index + 1}`));
  });
});
