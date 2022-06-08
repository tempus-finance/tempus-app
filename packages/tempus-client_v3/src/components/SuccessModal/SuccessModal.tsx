import Lottie from 'lottie-react';
import { FC, memo } from 'react';
import { ActionButton, ActionButtonLabels, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import confettiAnimation from './animation/confetti.json';
import './SuccessModal.scss';

export interface SuccessModalProps extends ModalProps {
  description: string;
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
  secondaryButtonLabel: ActionButtonLabels;
  onSecondaryButtonClick: () => void;
}

const SuccessModal: FC<SuccessModalProps> = props => {
  const {
    open,
    onClose,
    title,
    description,
    primaryButtonLabel,
    onPrimaryButtonClick,
    secondaryButtonLabel,
    onSecondaryButtonClick,
  } = props;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="tc__success-modal__content">
        <Typography variant="body-primary">{description}</Typography>
        <div className="tc__success-modal__animation">
          <Lottie animationData={confettiAnimation} loop={false} autoplay />
          <Typography className="tc__success-modal__title" variant="subtitle" weight="bold">
            {title}
          </Typography>
        </div>
        <div className="tc__success-modal__action-buttons">
          <ActionButton
            labels={secondaryButtonLabel}
            onClick={onSecondaryButtonClick}
            variant="secondary"
            size="large"
          />
          <ActionButton labels={primaryButtonLabel} onClick={onPrimaryButtonClick} variant="primary" size="large" />
        </div>
      </div>
    </Modal>
  );
};

export default memo(SuccessModal);
