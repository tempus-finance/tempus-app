import { fireEvent, render } from '@testing-library/react';
import MaturityTerm from './MaturityTerm';
import TermTabs, { TermTabsProps } from './TermTabs';

const mockOnChange = jest.fn<void, [MaturityTerm]>();

const subject = (props: TermTabsProps) => render(<TermTabs {...props} />);

describe('TermTabs', () => {
  it('renders a two-button term tabs', () => {
    const { baseElement, getAllByRole } = subject({
      terms: [
        {
          apr: 0.042,
          date: new Date(2022, 0, 1),
        },
        {
          apr: 0.1,
          date: new Date(2022, 5, 1),
        },
      ],
    });

    const buttons = getAllByRole('button');
    buttons.forEach(button => expect(button).not.toBeNull());

    expect(baseElement).toMatchSnapshot();
  });

  it('calls `onChange` when a term tab is clicked', () => {
    const terms = [
      {
        apr: 0.042,
        date: new Date(2022, 0, 1),
      },
      {
        apr: 0.1,
        date: new Date(2022, 5, 1),
      },
      {
        apr: 0.125,
        date: new Date(2022, 10, 1),
      },
    ];
    const { getAllByRole } = subject({
      terms,
      onChange: mockOnChange,
    });

    const buttons = getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(terms[1]);
  });
});
