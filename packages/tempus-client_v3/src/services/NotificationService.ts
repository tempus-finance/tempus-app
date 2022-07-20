import { Observable, ReplaySubject, Subject, interval, tap, filter, take, scan } from 'rxjs';
import { v1 as uuid } from 'uuid';
import { Chain, StorageService } from 'tempus-core-services';
import {
  Notification,
  NotificationCategory,
  NotificationLevel,
  NotificationInput,
  NotificationText,
} from '../interfaces';
import { NotificationData, NotificationStatus, TransactionData } from '../interfaces/Notification';

export const NOTIFICATIONS_KEY = 'notifications_v3';
const NOTIFICATION_HISTORY_SIZE = 20;

class NotificationService {
  private notificationQueue: Subject<Notification> = new Subject<Notification>();
  private notificationHistory: ReplaySubject<Notification> = new ReplaySubject<Notification>(NOTIFICATION_HISTORY_SIZE);

  constructor(private storageService: StorageService) {
    this.restoreNotifications();
  }

  warn(input: NotificationInput): void {
    const { chain, category, status, title, content, link, linkText, refId } = input;
    this.addToQueue(chain, category, status, NotificationLevel.WARNING, title, content, link, linkText, refId);
  }

  notify(input: NotificationInput): void {
    const { chain, category, status, title, content, link, linkText, refId } = input;
    this.addToQueue(chain, category, status, NotificationLevel.INFO, title, content, link, linkText, refId);
  }

  notifyTransaction(status: NotificationStatus, data: TransactionData): void {
    const { chain, txnId } = data;

    // for transaction notification we dont rely on title/content/link, we render the notification from data
    // TODO: revisit in the future to see whether we need to store title/content/link
    this.addToQueue(chain, 'Transaction', status, NotificationLevel.INFO, '', '', '', '', txnId, data);
  }

  getNextItem(): Observable<Notification> {
    return this.notificationQueue.asObservable();
  }

  getLastItems(): Observable<Notification[]> {
    return this.notificationHistory
      .asObservable()
      .pipe(scan((allNotifications, notification) => allNotifications.concat(notification), [] as Notification[]));
  }

  deleteNotifications(): void {
    this.storageService.delete(NOTIFICATIONS_KEY);
  }

  dismissNotification(id: string): void {
    const storedNotifications = this.retrieveNotifications();
    const targetNotificationIdx = storedNotifications.findIndex(notification => notification.id === id);
    if (targetNotificationIdx > -1) {
      this.deleteNotifications();
      storedNotifications[targetNotificationIdx].dismissed = true;
      this.storageService.set(NOTIFICATIONS_KEY, storedNotifications.reverse());
    }
  }

  private addToQueue(
    chain: Chain,
    category: NotificationCategory,
    status: NotificationStatus,
    level: NotificationLevel,
    title: NotificationText,
    content: NotificationText,
    link?: string,
    linkText?: NotificationText,
    refId?: string,
    data?: NotificationData,
  ) {
    const notification = {
      category,
      status,
      chain,
      level,
      title,
      content,
      link,
      linkText,
      id: uuid(),
      timestamp: Date.now(),
      dismissed: false,
      refId,
      data,
    };
    this.emitNotification(notification);
  }

  private emitNotification(notification: Notification) {
    const { category, dismissed } = notification;
    if (category === 'Transaction') {
      this.storeNotification(notification);
      this.notificationHistory.next(notification);
    }
    if (!dismissed) {
      this.notificationQueue.next(notification);
    }
  }

  private storeNotification(notification: Notification) {
    const updatedNotifications = [
      notification,
      ...this.retrieveNotifications().slice(0, NOTIFICATION_HISTORY_SIZE - 1),
    ];
    this.storageService.set(NOTIFICATIONS_KEY, updatedNotifications);
  }

  private restoreNotifications() {
    interval(100)
      .pipe(
        filter(() => this.notificationHistory.observed),
        tap(() => {
          const storedNotifications = this.retrieveNotifications();
          this.deleteNotifications();

          storedNotifications.forEach(notification => {
            this.emitNotification(notification);
          });
        }),
        take(1),
      )
      .subscribe();
  }

  private retrieveNotifications(): Notification[] {
    const notificationList = this.storageService.get(NOTIFICATIONS_KEY);

    if (notificationList && Array.isArray(notificationList)) {
      return notificationList.reverse();
    }

    return [];
  }
}

export default NotificationService;
