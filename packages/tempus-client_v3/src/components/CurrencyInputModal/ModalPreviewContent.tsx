import { FC } from 'react';
import { useWalletAddress } from '../../hooks';
import { ActionButton, ActionButtonLabels } from '../shared';
import Wallet from '../Wallet';

interface ModalPreviewContentProps {
  actionButtonLabels: ActionButtonLabels;
  actionButtonDisabled?: boolean;
  onActionButtonClick: () => void;
  onConnectWalletClick?: () => void;
}

const ModalPreviewContent: FC<ModalPreviewContentProps> = props => {
  const { actionButtonLabels, actionButtonDisabled, onActionButtonClick, onConnectWalletClick, children } = props;
  const [walletAddress] = useWalletAddress();

  return (
    <>
      {children}
      <div className="tc__currency-input-modal__action-container">
        {walletAddress !== '' ? (
          <ActionButton
            labels={actionButtonLabels}
            onClick={onActionButtonClick}
            variant="primary"
            size="large"
            fullWidth
            state={actionButtonDisabled ? 'disabled' : 'default'}
          />
        ) : (
          <Wallet
            connectWalletButtonVariant="primary"
            onConnectWalletClick={onConnectWalletClick}
            redirectTo={window.location.pathname}
          />
        )}
      </div>
    </>
  );
};

export default ModalPreviewContent;