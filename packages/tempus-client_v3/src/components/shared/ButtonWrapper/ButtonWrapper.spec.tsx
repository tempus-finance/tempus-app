import { fireEvent, render } from '@testing-library/react';
import ButtonWrapper, { ButtonWrapperProps } from './ButtonWrapper';

const mockOnClick = jest.fn();

const defaultProps: ButtonWrapperProps = {
  title: 'my title',
  onClick: mockOnClick,
};

const subject = (props: ButtonWrapperProps) => render(<ButtonWrapper {...props}>My Button</ButtonWrapper>);

describe('Button', () => {
  it('renders a button with a title attribute', () => {
    const { queryByTitle, queryByText } = subject(defaultProps);

    const actualText = queryByText('My Button');
    const actualLabel = queryByTitle('my title');

    expect(actualText).not.toBeNull();
    expect(actualLabel).not.toBeNull();

    expect(actualText).toMatchSnapshot();
  });

  it('calls `onClick` when the button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
