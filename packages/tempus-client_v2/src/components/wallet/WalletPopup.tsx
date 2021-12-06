import { FC, RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Divider, Popper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { LanguageContext } from '../../context/languageContext';
import getNotificationService from '../../services/getNotificationService';
import { Notification } from '../../services/NotificationService';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import WalletNotification from './WalletNotification';
import './WalletPopup.scss';

type WalletPopupInProps = {
  anchorElement: RefObject<HTMLDivElement>;
  open: boolean;
  account?: string | null;
};

type WalletPopupOutProps = {
  onClose: () => void;
};

type WalletPopupProps = WalletPopupInProps & WalletPopupOutProps;

const WalletPopup: FC<WalletPopupProps> = ({ anchorElement, open, account, onClose }) => {
  const { language } = useContext(LanguageContext);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const clearNotifications = useCallback(() => {
    getNotificationService().deleteNotifications();
    setNotifications([]);
  }, []);

  useEffect(() => {
    const notificationStream$ = getNotificationService()
      .getNextItem()
      .subscribe(notification => {
        if (notification) {
          setNotifications((prev: any) => [notification, ...prev.slice(0, 4)]);
        }
      });

    return () => notificationStream$.unsubscribe();
  }, [setNotifications]);

  return (
    <>
      <Popper className="tc__wallet__popper" open={open} anchorEl={anchorElement.current} placement="top-end">
        <div className="tc__wallet__popper__container">
          <div className="tc__wallet__popper__section tc__wallet__popper__section-header">
            <Typography variant="dropdown-text">{getText('walletOverview', language)}</Typography>
            <Button onClick={onClose}>
              <CloseIcon />
            </Button>
          </div>
          <Divider />
          <div className="tc__wallet__popper__section tc__wallet__popper__section-account">
            <div className="tc__wallet__popper__section__title">
              <Typography variant="dropdown-text" color="title">
                {getText('connectedWallet', language)}
              </Typography>
            </div>
            <Typography variant="dropdown-text">{account}</Typography>
          </div>
          <Divider />
          <div className="tc__wallet__popper__section tc__wallet__popper__section-transactions">
            <div className="tc__wallet__popper__section__title">
              <Typography variant="dropdown-text" color="title">
                {getText('transactionHistory', language)}
              </Typography>
              <Button onClick={clearNotifications}>
                <Typography variant="disclaimer-text" color="title">
                  {getText('clear', language)}
                </Typography>
              </Button>
            </div>
            <Spacer size={15} />
            {notifications &&
              notifications.map(notification => <WalletNotification key={notification.id} {...notification} />)}
          </div>
        </div>
      </Popper>
      {open && <div className="tc__backdrop" onClick={onClose} />}
    </>
  );
};

export default WalletPopup;
