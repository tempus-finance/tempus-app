import React, { FC, ReactNode, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Typography from '../Typography';

import './Modal.scss';

type ModalVariant = 'plain' | 'styled';
type ModalSize = 'small' | 'large';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  className?: string;
  header?: ReactNode;
}

export interface ModalStyleProps {
  variant?: ModalVariant;
  size?: ModalSize;
}

const Modal: FC<ModalProps & ModalStyleProps> = props => {
  const {
    title = '',
    open,
    onClose,
    onBack,
    className = '',
    variant = 'plain',
    size = 'small',
    header,
    children,
  } = props;

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
      <div className={`tc__modal-container ${className}`}>
        <div className={`tc__modal tc__modal__${variant} tc__modal__size-${size}`}>
          <div className="tc__modal-header">
            <Typography variant="body-primary" weight="bold">
              {size === 'small' && title}
            </Typography>
            <ButtonWrapper onClick={onCloseButtonClick}>
              <Icon variant="close" size={size === 'small' ? 'small' : 20} />
            </ButtonWrapper>
            {header && <div className="tc__modal-header-content">{header}</div>}
          </div>
          <div className="tc__modal__body">
            {size === 'large' && (title || onBack) && (
              <div className="tc__currency-input-modal__nav">
                {onBack && (
                  <ButtonWrapper onClick={onBack}>
                    <Icon variant="left-chevron" size="small" />
                  </ButtonWrapper>
                )}
                <Typography variant="subtitle" weight="bold">
                  {title}
                </Typography>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(Modal) as FC<ModalProps & ModalStyleProps>;
