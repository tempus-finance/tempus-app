import React, { FC, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Typography from '../Typography';

import './Modal.scss';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const Modal: FC<ModalProps> = props => {
  const { title = '', open, onClose, children } = props;

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
        <div className="tc__modal">
          <div className="tc__modal-header">
            <Typography variant="body-primary" weight="bold">
              {title}
            </Typography>
            <ButtonWrapper onClick={onCloseButtonClick}>
              <Icon variant="close" size={20} />
            </ButtonWrapper>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};
export default React.memo(Modal) as FC<ModalProps>;
