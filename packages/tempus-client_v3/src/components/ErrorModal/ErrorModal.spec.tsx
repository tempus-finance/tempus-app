import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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

  it('renders a metamask error modal', () => {
    const props = {
      ...defaultProps,
      error: { code: 4001 } as unknown as Error,
    };
    const { container, getByText } = subject(props);

    expect(container).not.toBeNull();

    const title = getByText(defaultProps.title as string);

    expect(title).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a generic error modal', () => {
    const props = {
      ...defaultProps,
      error: { message: 'some error occurs' } as unknown as Error,
    };
    const { container, getByText } = subject(props);

    expect(container).not.toBeNull();

    const title = getByText(defaultProps.title as string);

    expect(title).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders a slippage error modal', () => {
    const props = {
      ...defaultProps,
      error: { data: { code: 3, message: 'revised transaction: BAL#507' } } as unknown as Error,
    };
    const { container, getByText } = subject(props);

    expect(container).not.toBeNull();

    const title = getByText(defaultProps.title as string);

    expect(title).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('update slippage when slippage input is set to 2.5%', async () => {
    const props = {
      ...defaultProps,
      error: { data: { code: 3, message: 'revised transaction: BAL#507' } } as unknown as Error,
    };
    const { container, getByRole } = subject(props);

    const slippageInput = getByRole('textbox');

    expect(slippageInput).not.toBeNull();

    act(() => {
      fireEvent.change(slippageInput, { target: { value: '2.5' } });
    });

    expect(container).toMatchSnapshot();
  });

  it('update slippage when slippage input is set to auto', async () => {
    const props = {
      ...defaultProps,
      error: { data: { code: 3, message: 'revised transaction: BAL#507' } } as unknown as Error,
    };
    const { container, getByRole } = subject(props);

    const autoButton = getByRole('button', { name: 'Auto' });

    expect(autoButton).not.toBeNull();

    act(() => {
      fireEvent.click(autoButton);
    });

    expect(container).toMatchSnapshot();
  });
});
