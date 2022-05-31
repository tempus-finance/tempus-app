import { fireEvent, render } from '@testing-library/react';
import ShowMoreButtonWrapper, { ShowMoreButtonWrapperProps } from './ShowMoreButtonWrapper';

const mockOnClick = jest.fn();

const defaultProps: ShowMoreButtonWrapperProps = {
  chain: 'ethereum',
  label: 'Show more',
  onClick: mockOnClick,
};

const subject = (props: ShowMoreButtonWrapperProps) => render(<ShowMoreButtonWrapper {...props} />);

describe('ShowMoreButtonWrapper', () => {
  it('renders the button', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('clicks will trigger onClick', () => {
    const { getByRole } = subject(defaultProps);

    const button = getByRole('button');

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(defaultProps.chain);
  });
});
