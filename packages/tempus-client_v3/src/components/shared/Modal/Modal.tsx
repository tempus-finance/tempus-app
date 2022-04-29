import React, { FC, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Typography from '../Typography';

import './Modal.scss';

type ModalVariant = 'plain' | 'styled';
type ModalSize = 'small' | 'large';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

interface ModalStyleProps {
  variant?: ModalVariant;
  size?: ModalSize;
}

const Modal: FC<ModalProps & ModalStyleProps> = props => {
  const { title = '', open, onClose, variant = 'plain', size = 'small', children } = props;

  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    onClose();
  };

  const onCloseButtonClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div id="modal-backdrop" className="tc__modal-backdrop" onClick={onBackdropClick} />
      <div className="tc__modal-container">
        <div className={`tc__modal tc__modal__${variant} tc__modal__size-${size}`}>
          <div className="tc__modal-header">
            <Typography variant="body-primary" weight="bold">
              {title}
            </Typography>
            <ButtonWrapper onClick={onCloseButtonClick}>
              <Icon variant="close" size={size === 'small' ? 'small' : 20} />
            </ButtonWrapper>
          </div>
          <div className="tc__modal__body">{children}</div>
        </div>
      </div>
    </>
  );
};
export default React.memo(Modal) as FC<ModalProps & ModalStyleProps>;
