import { FC, memo } from 'react';
import { ActionButton, ActionButtonLabels, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import SlippageErrorModal from './SlippageErrorModal';
import HungryCatLogo from './HungryCatLogo';

import './ErrorModal.scss';

export interface TransactionError extends Error {
  data?: {
    code: number;
    message: string;
  };
}

export interface ErrorModalProps extends ModalProps {
  description: string;
  error?: TransactionError;
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
}

const getTransactionError = (error?: TransactionError) => error?.data?.message.match(/BAL#\d+/)?.[0];

const ErrorModal: FC<ErrorModalProps> = props => {
  const { open, onClose, title, description, error, primaryButtonLabel, onPrimaryButtonClick } = props;

  // check transaction error
  const txnErrorCode = getTransactionError(error);
  if (txnErrorCode === 'BAL#507') {
    // SWAP_LIMIT: Swap violates user-supplied limits (min out or max in)
    return (
      <SlippageErrorModal
        open={open}
        onClose={onClose}
        title={title}
        primaryButtonLabel={primaryButtonLabel}
        onPrimaryButtonClick={onPrimaryButtonClick}
      />
    );
  }
  if (txnErrorCode) {
    // ref: https://dev.balancer.fi/references/error-codes
  }

  // check non-transaction error

  return (
    <Modal open={open} onClose={onClose}>
      <div className="tc__error-modal__content">
        <Typography className="tc__error-modal__title" variant="subtitle" weight="bold">
          {title}
        </Typography>
        <Typography variant="body-primary">{description}</Typography>
        <div className="tc__error-modal__animation">
          <HungryCatLogo />
        </div>
        <div className="tc__error-modal__action-buttons">
          <ActionButton labels={primaryButtonLabel} onClick={onPrimaryButtonClick} variant="primary" size="large" />
        </div>
        {error?.message && <Typography variant="body-primary">{error?.message}</Typography>}
      </div>
    </Modal>
  );
};

export default memo(ErrorModal);
