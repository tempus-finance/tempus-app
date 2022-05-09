import { fireEvent, render } from '@testing-library/react';
import Modal, { ModalProps, ModalStyleProps } from './Modal';

const mockOnCloseHandler = jest.fn();

const defaultProps: ModalProps = {
  open: true,
  onClose: mockOnCloseHandler,
};

const modalContentText = 'This is modal content.';

const subject = (props: ModalProps & ModalStyleProps) => render(<Modal {...props}>{modalContentText}</Modal>);

describe('Modal', () => {
  it('renders child elements when small modal is open', () => {
    const { container, getByText } = subject({ ...defaultProps, size: 'small' });

    const modalContent = getByText(modalContentText);

    expect(modalContent).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('renders child elements when large modal is open', () => {
    const { container, getByText } = subject({ ...defaultProps, size: 'large' });

    const modalContent = getByText(modalContentText);

    expect(modalContent).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('does not render child elements when modal is closed', () => {
    const { container, queryByText } = subject({ open: false, onClose: mockOnCloseHandler });

    const modalContent = queryByText(modalContentText);

    expect(modalContent).toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('calls onClose when user clicks on backdrop', () => {
    const { container } = subject(defaultProps);

    const backdrop = container.querySelector('#modal-backdrop');
    expect(backdrop).not.toBeNull();

    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnCloseHandler).toHaveBeenCalledTimes(1);

    expect(container).toMatchSnapshot();
  });

  it('calls onClose when user clicks on the close button', () => {
    const { getByRole } = subject(defaultProps);

    const closeButton = getByRole('button');
    expect(closeButton).not.toBeNull();

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnCloseHandler).toHaveBeenCalledTimes(1);

    expect(closeButton).toMatchSnapshot();
  });
});
