import { fireEvent, render } from '@testing-library/react';
import ErrorModal, { ErrorModalProps } from './ErrorModal';

const mockOnPrimaryButtonClick = jest.fn();

const defaultProps: ErrorModalProps = {
  open: true,
  onClose: () => {},
  title: "Something's wrong",
  description: 'Modal description',
  primaryButtonLabel: {
    default: 'Primary Button',
    loading: '',
    success: '',
  },
  onPrimaryButtonClick: mockOnPrimaryButtonClick,
};

const subject = (props: ErrorModalProps) => render(<ErrorModal {...props} />);

describe('ErrorModal', () => {
  it('renders a error modal', () => {
    const { container, getByText } = subject(defaultProps);

    expect(container).not.toBeNull();

    const title = getByText(defaultProps.title as string);

    expect(title).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('calls `onClick` when primary button is clicked', async () => {
    const { getByRole } = subject(defaultProps);

    const primaryButton = getByRole('button', { name: defaultProps.primaryButtonLabel.default });

    expect(primaryButton).not.toBeNull();
    expect(primaryButton).toHaveClass('tc__actionButton-border-primary-large');

    fireEvent.click(primaryButton);

    expect(mockOnPrimaryButtonClick).toHaveBeenCalled();
    expect(primaryButton).toMatchSnapshot();
  });
});
