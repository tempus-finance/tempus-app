import { FC, useCallback, useEffect, useState } from 'react';
import getNotificationService from '../../services/getNotificationService';
import { Notification } from '../../services/NotificationService';
import NotificationComponent from './NotificationComponent';

import './Notification.scss';

const NotificationContainer: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const onNotificationDelete = useCallback(
    (id: string) => {
      setNotifications(notifications.filter(notification => notification.id !== id));
    },
    [notifications, setNotifications],
  );

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
        if (notification) {
          // Create auto close timer for new notification if web page tab is visible when notification is created
          if (!document.hidden) {
            autoCloseNotification(notification.id);
          }

          setNotifications([...notifications, notification]);
        }
      });

    return () => notificationStream$.unsubscribe();
  }, [autoCloseNotification, notifications, setNotifications]);

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
