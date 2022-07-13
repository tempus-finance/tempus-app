import { FC, memo, useMemo } from 'react';
import { TransactionError } from 'tempus-core-services';
import { ActionButton, ActionButtonLabels, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import SlippageErrorModal from './SlippageErrorModal';
import WalletErrorModal from './WalletErrorModal';
import RpcErrorModal from './RpcErrorModal';
import HungryCatLogo from './HungryCatLogo';

import './ErrorModal.scss';

export interface ErrorModalProps extends ModalProps {
  description: string;
  error?: Error;
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
}

const ErrorModal: FC<ErrorModalProps> = props => {
  const { open, onClose, title, description, error, primaryButtonLabel, onPrimaryButtonClick } = props;

  const transactionError = useMemo(() => new TransactionError(error), [error]);

  if (transactionError.balancerErrorCode === 507) {
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

  if (transactionError.isWalletError) {
    return (
      <WalletErrorModal
        open={open}
        onClose={onClose}
        title={title}
        error={error as Error}
        primaryButtonLabel={primaryButtonLabel}
        onPrimaryButtonClick={onPrimaryButtonClick}
      />
    );
  }

  if (transactionError.isRpcError) {
    return (
      <RpcErrorModal
        open={open}
        onClose={onClose}
        title={title}
        error={error as Error}
        primaryButtonLabel={primaryButtonLabel}
        onPrimaryButtonClick={onPrimaryButtonClick}
      />
    );
  }

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
