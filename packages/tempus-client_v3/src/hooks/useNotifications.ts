import { bind } from '@react-rxjs/core';
import { Notification, NotificationInput } from '../interfaces';
import { getNotificationService } from '../services';

const warn = (input: NotificationInput) => getNotificationService().warn(input);
const notify = (input: NotificationInput) => getNotificationService().notify(input);
const deleteNotifications = () => getNotificationService().deleteNotifications();
const dismissNotification = (id: string) => getNotificationService().dismissNotification(id);

export const useNotifications = (): {
  warn: (payload: NotificationInput) => void;
  notify: (payload: NotificationInput) => void;
  deleteNotifications: () => void;
  dismissNotification: (id: string) => void;
  getNextItem: () => Notification | null;
  getLastItems: () => Notification | null;
} => {
  const [getNextItem] = bind(getNotificationService().getNextItem(), null);
  const [getLastItems] = bind(getNotificationService().getLastItems(), null);

  return { notify, warn, deleteNotifications, dismissNotification, getNextItem, getLastItems };
};
