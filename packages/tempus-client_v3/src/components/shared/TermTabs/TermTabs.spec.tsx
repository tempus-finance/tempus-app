import { fireEvent, render } from '@testing-library/react';
import TermTabs, { TermTabsProps } from './TermTabs';

const mockOnChange = jest.fn<Date, any>();

const subject = (props: TermTabsProps) => render(<TermTabs {...props} />);

describe('TermTabs', () => {
  it('renders a two-button term tabs', () => {
    const { getAllByRole } = subject({ dates: [new Date(2022, 0, 1), new Date(2022, 5, 1)] });

    const buttons = getAllByRole('button');
    buttons.forEach(button => expect(button).not.toBeNull());
  });

  it('calls `onChange` when a term tab is clicked', () => {
    const { getAllByRole } = subject({
      dates: [new Date(2022, 0, 1), new Date(2022, 5, 1), new Date(2022, 10, 1)],
      onChange: mockOnChange,
    });

    const buttons = getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
