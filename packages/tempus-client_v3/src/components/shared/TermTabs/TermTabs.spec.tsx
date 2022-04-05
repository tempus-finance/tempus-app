import { fireEvent, render } from '@testing-library/react';
import TermTabs, { TermTabsProps } from './TermTabs';

const mockOnChange = jest.fn<void, [Date]>();

const subject = (props: TermTabsProps) => render(<TermTabs {...props} />);

describe('TermTabs', () => {
  it('renders a two-button term tabs', () => {
    const { baseElement, getAllByRole } = subject({ dates: [new Date(2022, 0, 1), new Date(2022, 5, 1)] });

    const buttons = getAllByRole('button');
    buttons.forEach(button => expect(button).not.toBeNull());

    expect(baseElement).toMatchSnapshot();
  });

  it('calls `onChange` when a term tab is clicked', () => {
    const dates = [new Date(2022, 0, 1), new Date(2022, 5, 1), new Date(2022, 10, 1)];
    const { getAllByRole } = subject({ dates: dates, onChange: mockOnChange });

    const buttons = getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(dates[1]);
  });
});
