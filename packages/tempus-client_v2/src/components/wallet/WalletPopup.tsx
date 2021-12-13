import { FC, RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Divider, Popper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { LanguageContext } from '../../context/languageContext';
import { Notification } from '../../interfaces/Notification';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import getNotificationService from '../../services/getNotificationService';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import WalletNotification from './WalletNotification';
import WalletPending from './WalletPending';
import './WalletPopup.scss';

type WalletPopupInProps = {
  anchorElement: RefObject<HTMLDivElement>;
  account?: string | null;
};

type WalletPopupOutProps = {
  onSwitchWallet: () => void;
  onClose: () => void;
};

type WalletPopupProps = WalletPopupInProps & WalletPopupOutProps;

const WalletPopup: FC<WalletPopupProps> = ({ anchorElement, account, onSwitchWallet, onClose }) => {
  const { openWalletPopup } = useContext(UserSettingsContext);
  const { language } = useContext(LanguageContext);
  const { pendingTransactions } = useContext(PendingTransactionsContext);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const clearNotifications = useCallback(() => {
    getNotificationService().deleteNotifications();
    setNotifications([]);
  }, []);

  const switchWallet = useCallback(() => {
    onSwitchWallet && onSwitchWallet();
  }, [onSwitchWallet]);

  useEffect(() => {
    const notificationStream$ = getNotificationService()
      .getLastItems()
      .subscribe(notification => {
        if (notification) {
          setNotifications((prev: any) => [notification, ...prev.slice(0, 4)]);
        }
      });

    return () => notificationStream$.unsubscribe();
  }, [setNotifications]);

  return (
    <>
      <Popper
        className="tc__wallet__popper"
        open={openWalletPopup}
        anchorEl={anchorElement.current}
        placement="top-end"
      >
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
              <Button onClick={switchWallet}>
                <Typography variant="disclaimer-text" color="title">
                  {getText('switchWallet', language)}
                </Typography>
              </Button>
            </div>
            <Typography variant="dropdown-text">{account}</Typography>
          </div>
          {pendingTransactions && pendingTransactions.length > 0 && (
            <>
              <Divider />
              <div className="tc__wallet__popper__section tc__wallet__popper__section-transactions">
                <div className="tc__wallet__popper__section__title">
                  <Typography variant="dropdown-text" color="title">
                    {getText('pendingTransactions', language)}
                  </Typography>
                </div>
                <Spacer size={15} />
                {pendingTransactions.map(pendingTransaction => (
                  <WalletPending key={pendingTransaction.hash} {...pendingTransaction} />
                ))}
              </div>
            </>
          )}
          {notifications && notifications.length > 0 && (
            <>
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
                {notifications.map(notification => (
                  <WalletNotification key={notification.id} {...notification} />
                ))}
              </div>
            </>
          )}
        </div>
      </Popper>
      {openWalletPopup && <div className="tc__backdrop" onClick={onClose} />}
    </>
  );
};

export default WalletPopup;
