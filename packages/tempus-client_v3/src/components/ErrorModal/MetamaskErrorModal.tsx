import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionButton, ActionButtonLabels, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import HungryCatLogo from './HungryCatLogo';

import './ErrorModal.scss';

export interface MetamaskErrorModalProps extends ModalProps {
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
}

const MetamaskErrorModal: FC<MetamaskErrorModalProps> = props => {
  const { open, onClose, title, primaryButtonLabel, onPrimaryButtonClick } = props;
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="tc__error-modal__content">
        <Typography className="tc__error-modal__title" variant="subtitle" weight="bold">
          {title}
        </Typography>
        <Typography variant="body-primary">{t('MetamaskErrorModal.errorModalDescription')}</Typography>
        <div className="tc__error-modal__animation">
          <HungryCatLogo />
        </div>
        <div className="tc__error-modal__action-buttons">
          <ActionButton labels={primaryButtonLabel} onClick={onPrimaryButtonClick} variant="primary" size="large" />
        </div>
      </div>
    </Modal>
  );
};

export default memo(MetamaskErrorModal);
