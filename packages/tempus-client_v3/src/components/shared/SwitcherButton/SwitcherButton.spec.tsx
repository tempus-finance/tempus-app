import { fireEvent, render } from '@testing-library/react';
import SwitcherButton, { SwitcherButtonProps } from './SwitcherButton';

const mockOnClick = jest.fn();

const defaultProps: SwitcherButtonProps = {
  logoType: 'wallet-metamask',
  label: 'button label',
  title: 'button title',
  selected: false,
  onClick: mockOnClick,
};

const subject = (props: SwitcherButtonProps) => render(<SwitcherButton {...props} />);

describe('SwitcherButton', () => {
  it('renders a button with a title attribute', () => {
    const { getByRole, queryByTitle, queryByText } = subject(defaultProps);

    const button = getByRole('button');
    const actualText = queryByText('button label');
    const actualLabel = queryByTitle('button title');

    expect(actualText).not.toBeNull();
    expect(actualLabel).not.toBeNull();

    expect(button).toMatchSnapshot();
  });

  it('renders a selected button', () => {
    const { getByRole, queryByTitle, queryByText } = subject({ ...defaultProps, selected: true });

    const button = getByRole('button');
    const actualText = queryByText('button label');
    const actualLabel = queryByTitle('button title');

    expect(actualText).not.toBeNull();
    expect(actualLabel).not.toBeNull();

    expect(button).toMatchSnapshot();
  });

  it('calls `onClick` when the button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
