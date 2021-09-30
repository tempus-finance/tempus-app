import { FC, useCallback, useEffect, useState } from 'react';
import getNotificationService from '../../services/getNotificationService';
import { Notification } from '../../services/NotificationService';
import NotificationComponent from './NotificationComponent';

import './notification.scss';

const NotificationContainer: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const notificationStream$ = getNotificationService()
      .getNextItem()
      .subscribe(notification => {
        if (notification) {
          setNotifications([...notifications, notification]);
        }
      });

    return () => notificationStream$.unsubscribe();
  }, [notifications, setNotifications]);

  const onNotificationDelete = useCallback(
    (id: number) => {
      setNotifications(notifications.filter(notification => notification.id !== id));
    },
    [notifications, setNotifications],
  );

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
