import { fireEvent, render } from '@testing-library/react';
import SuccessModal, { SuccessModalProps } from './SuccessModal';

const mockOnPrimaryButtonClick = jest.fn();
const mockOnSecondaryButtonClick = jest.fn();

const defaultProps: SuccessModalProps = {
  open: true,
  onClose: () => {},
  title: 'Success',
  description: 'Modal description',
  primaryButtonLabel: {
    default: 'Primary Button',
    loading: '',
    success: '',
  },
  onPrimaryButtonClick: mockOnPrimaryButtonClick,
  secondaryButtonLabel: {
    default: 'Secondary Button',
    loading: '',
    success: '',
  },
  onSecondaryButtonClick: mockOnSecondaryButtonClick,
};

jest.mock('lottie-react', () => () => <div className="lottie-animation" />);

const subject = (props: SuccessModalProps) => render(<SuccessModal {...props} />);

describe('SuccessModal', () => {
  it('renders a success modal', () => {
    const { container, getByText } = subject(defaultProps);

    const animationContainer = container.querySelector('.tc__success-modal__animation .lottie-animation');
    const title = getByText(defaultProps.title as string);

    expect(animationContainer).not.toBeNull();
    expect(title).not.toBeNull();

    expect(container).not.toBeNull();
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

  it('calls `onClick` when secondary button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const secondaryButton = getByRole('button', { name: defaultProps.secondaryButtonLabel.default });

    expect(secondaryButton).not.toBeNull();
    expect(secondaryButton).toHaveClass('tc__actionButton-border-secondary-large');

    fireEvent.click(secondaryButton);

    expect(mockOnSecondaryButtonClick).toHaveBeenCalledTimes(1);
    expect(secondaryButton).toMatchSnapshot();
  });
});
