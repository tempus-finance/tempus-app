import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import { Notification } from '../../interfaces/Notification';
import getNotificationService from '../../services/getNotificationService';
import NotificationComponent from './NotificationComponent';

import './Notification.scss';

const NotificationContainer: FC = () => {
  const { setUserSettings } = useContext(UserSettingsContext);
  const { userWalletChain } = useContext(WalletContext);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const onNotificationDelete = useCallback(
    (id: string) => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      getNotificationService().dismissNotification(id);
    },
    [setNotifications],
  );

  const openTransactions = useCallback(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({ ...prevState, openWalletPopup: true }));
    }
  }, [setUserSettings]);

  const autoCloseNotification = useCallback(
    (id: string) => {
      setTimeout(() => {
        onNotificationDelete(id);
      }, 7000);
    },
    [onNotificationDelete],
  );

  useEffect(() => {
    const notificationStream$ = getNotificationService()
      .getNextItem()
      .subscribe(notification => {
        if (notification && notification.chain === userWalletChain) {
          // Create auto close timer for new notification if web page tab is visible when notification is created
          if (!document.hidden) {
            autoCloseNotification(notification.id);
          }

          setNotifications((prev: any) => [notification, ...prev]);
        }
      });

    return () => notificationStream$.unsubscribe();
  }, [userWalletChain, autoCloseNotification, setNotifications]);

  return (
    <div className="tc__notification-container">
      {notifications &&
        notifications.map(notification => (
          <NotificationComponent
            {...notification}
            key={notification.id}
            onNotificationDelete={onNotificationDelete}
            openTransactions={openTransactions}
          />
        ))}
    </div>
  );
};

export default NotificationContainer;
