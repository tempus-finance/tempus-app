import { FC, useCallback, useEffect, useState } from 'react';
import { bufferTime } from 'rxjs';
import getNotificationService from '../../services/getNotificationService';
import { Notification } from '../../services/NotificationService';
import NotificationComponent from './NotificationComponent';

import './notification.scss';

const NOTIFICATION_SELF_CLOSE_TIMEOUT = 20 * 1000;

const NotificationContainer: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const onNotificationDelete = useCallback(
    (id: string) => {
      setNotifications(notifications.filter(notification => notification.id !== id));
      getNotificationService().delete(id);
    },
    [notifications, setNotifications],
  );

  const autoCloseNotification = useCallback(
    (id: string) => {
      setTimeout(() => {
        onNotificationDelete(id);
      }, NOTIFICATION_SELF_CLOSE_TIMEOUT);
    },
    [onNotificationDelete],
  );

  useEffect(() => {
    const notificationStream$ = getNotificationService()
      .getNotifications()
      .pipe(bufferTime(500))
      .subscribe((notifications: Notification[]) => {
        if (notifications && notifications.length) {
          // Create auto close timer for new notification if web page tab is visible when notification is created
          if (!document.hidden) {
            notifications.forEach(notification => {
              autoCloseNotification(notification.id);
            });
          }
          setNotifications(previousNotifications => [...previousNotifications, ...notifications]);
        }
      });

    return () => {
      return notificationStream$.unsubscribe();
    };
  }, [autoCloseNotification, setNotifications]);

  return (
    <div className="tf__notification-container">
      {notifications &&
        notifications.map(({ id, level, title, content, link, linkText }) => (
          <NotificationComponent
            key={id}
            id={id}
            level={level}
            title={title}
            content={content}
            link={link}
            linkText={linkText}
            onNotificationDelete={onNotificationDelete}
          />
        ))}
    </div>
  );
};

export default NotificationContainer;
