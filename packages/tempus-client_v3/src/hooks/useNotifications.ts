import { bind } from '@react-rxjs/core';
import { BehaviorSubject, debounce, distinctUntilChanged, interval, Subscription, tap } from 'rxjs';
import { DEBOUNCE_IN_MS } from '../constants';
import { Notification, NotificationInput } from '../interfaces';
import { TransactionData, NotificationStatus } from '../interfaces/Notification';
import { getNotificationService } from '../services';

const warn = (input: NotificationInput) => getNotificationService().warn(input);
const notify = (input: NotificationInput) => getNotificationService().notify(input);
const deleteNotifications = () => getNotificationService().deleteNotifications();
const dismissNotification = (id: string) => getNotificationService().dismissNotification(id);
export const notifyTransaction = (status: NotificationStatus, data: TransactionData): void =>
  getNotificationService().notifyTransaction(status, data);

const notification$ = new BehaviorSubject<Notification | null>(null);
const notificationHistory$ = new BehaviorSubject<Notification[]>([]);

const getNotificationStream = () =>
  getNotificationService()
    .getNextItem()
    .pipe(tap(item => notification$.next(item)));

const getNotificationHistoryStream = () =>
  getNotificationService()
    .getLastItems()
    .pipe(
      distinctUntilChanged(
        (previous, current) =>
          current.length === previous.length && current.every((item, i) => item.id === previous[i].id),
      ),
      debounce<Notification[]>(() => interval(DEBOUNCE_IN_MS)),
      tap(lastItems => {
        const itemMap = lastItems.reduce((map, item) => {
          const key = item.refId ?? item.id;
          if (!map[key] || map[key].timestamp < item.timestamp) {
            return { ...map, [key]: item };
          }

          return map;
        }, {} as { [key: string]: Notification });
        const itemsWithLatestStatus = Object.values(itemMap).sort((itemA, itemB) => itemB.timestamp - itemA.timestamp);
        notificationHistory$.next(itemsWithLatestStatus);
      }),
    );

const [getNextItem] = bind(notification$, null);
const [getLastItems] = bind(notificationHistory$, []);

export const useNotifications = (): {
  warn: (payload: NotificationInput) => void;
  notify: (payload: NotificationInput) => void;
  deleteNotifications: () => void;
  dismissNotification: (id: string) => void;
  getNextItem: () => Notification | null;
  getLastItems: () => Notification[];
} => ({
  notify,
  warn,
  deleteNotifications,
  dismissNotification,
  getNextItem,
  getLastItems,
});

let subscriptions: Subscription[] = [];

export const subscribeNotifications = (): void => {
  unsubscribeNotifications();
  subscriptions = [getNotificationStream().subscribe(), getNotificationHistoryStream().subscribe()];
};
export const unsubscribeNotifications = (): void => subscriptions.forEach(subscription => subscription.unsubscribe());
export const resetNotifications = (): void => {
  notification$.next(null);
  notificationHistory$.next([]);
};
