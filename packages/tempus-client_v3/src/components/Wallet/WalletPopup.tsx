import { FC, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { shortenAccount } from 'tempus-core-services';
import { ButtonWrapper, Icon, Tooltip, Typography } from '../shared';

import './WalletPopup.scss';

export interface WalletPopupProps {
  open: boolean;
  address: string;
  onClose?: () => void;
}

const WalletPopup: FC<WalletPopupProps> = props => {
  const { open, address, onClose } = props;
  const { t } = useTranslation();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const wrapperPosX = wrapperRef.current.getBoundingClientRect().x;
      const wrapperPosY = wrapperRef.current.getBoundingClientRect().y;
      wrapperRef.current.style.setProperty('--popupPosX', `${wrapperPosX}px`);
      wrapperRef.current.style.setProperty('--popupPosY', `${wrapperPosY}px`);
      // Show backdrop after position for it is set
      wrapperRef.current.style.setProperty('--popupVisibility', 'block');
    }
  });

  const popupContent = useMemo(
    () => (
      <>
        <Typography className="tc__wallet-popup__title" variant="body-primary" weight="bold">
          {t('WalletPopup.title')}
        </Typography>
        <ButtonWrapper onClick={onClose}>
          <Icon variant="close" size="small" />
        </ButtonWrapper>
        <div className="tc__wallet-popup__address">
          <Typography className="tc__wallet-popup__address-title" variant="body-primary" weight="medium">
            {t('WalletPopup.titleAddress')}
          </Typography>
          <Typography variant="body-primary" type="mono" weight="medium">
            {shortenAccount(address)}
          </Typography>
        </div>
      </>
    ),
    [t, onClose, address],
  );

  return (
    <div className="tc__wallet-popup" ref={wrapperRef}>
      {open && <div className="tc__wallet-popup-backdrop" onClick={onClose} />}
      <Tooltip open={open} placement="bottom-center">
        {popupContent}
      </Tooltip>
    </div>
  );
};

export default WalletPopup;
