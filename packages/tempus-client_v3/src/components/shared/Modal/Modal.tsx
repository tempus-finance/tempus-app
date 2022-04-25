import React, { FC, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';

import './Modal.scss';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = props => {
  const { open, onClose, children } = props;

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
          <ButtonWrapper onClick={onCloseButtonClick}>
            <Icon variant="close" size={20} />
          </ButtonWrapper>
          {children}
        </div>
      </div>
    </>
  );
};
export default React.memo(Modal) as FC<ModalProps>;
