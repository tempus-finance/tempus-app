import { FC, memo } from 'react';
import { ActionButton, ActionButtonLabels, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import './ErrorModal.scss';
import HungryCatLogo from './HungryCatLogo';

export interface ErrorModalProps extends ModalProps {
  description: string;
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
}

const ErrorModal: FC<ErrorModalProps> = props => {
  const { open, onClose, title, description, primaryButtonLabel, onPrimaryButtonClick } = props;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="tc__eror-modal__content">
        <Typography className="tc__eror-modal__title" variant="subtitle" weight="bold">
          {title}
        </Typography>
        <Typography variant="body-primary">{description}</Typography>
        <div className="tc__eror-modal__animation">
          <HungryCatLogo />
        </div>
        <div className="tc__eror-modal__action-buttons">
          <ActionButton labels={primaryButtonLabel} onClick={onPrimaryButtonClick} variant="primary" size="large" />
        </div>
      </div>
    </Modal>
  );
};

export default memo(ErrorModal);
