import { Observable, ReplaySubject, Subject, interval, tap, filter } from 'rxjs';
import { v1 as uuid } from 'uuid';
import { Notification, NotificationCategory, NotificationLevel } from '../interfaces/Notification';
import { Chain } from '../interfaces/Chain';
import StorageService from './StorageService';

const NOTIFICATIONS_KEY = 'notifications';

class NotificationService {
  private notificationQueue: Subject<Notification> = new Subject<Notification>();
  private notificationHistory: ReplaySubject<Notification> = new ReplaySubject<Notification>(5);

  constructor(private storageService: StorageService) {
    this.restoreNotifications();
  }

  warn(chain: Chain, category: NotificationCategory, title: string, content: string, link?: string, linkText?: string) {
    this.addToQueue(chain, category, NotificationLevel.WARNING, title, content, link, linkText);
  }

  notify(
    chain: Chain,
    category: NotificationCategory,
    title: string,
    content: string,
    link?: string,
    linkText?: string,
  ) {
    this.addToQueue(chain, category, NotificationLevel.INFO, title, content, link, linkText);
  }

  getNextItem(): Observable<Notification> {
    return this.notificationQueue.asObservable();
  }

  getLastItems(): Observable<Notification> {
    return this.notificationHistory.asObservable();
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
      this.storageService.set(NOTIFICATIONS_KEY, storedNotifications);
    }
  }

  private addToQueue(
    chain: Chain,
    category: NotificationCategory,
    level: NotificationLevel,
    title: string,
    content: string,
    link?: string,
    linkText?: string,
  ) {
    const notification = {
      category,
      chain,
      level,
      title,
      content,
      link,
      linkText,
      id: uuid(),
      timestamp: Date.now(),
      dismissed: false,
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
    const updatedNotifications = [notification, ...this.retrieveNotifications().slice(0, 4)];
    this.storageService.set(NOTIFICATIONS_KEY, updatedNotifications);
  }

  private restoreNotifications() {
    const restoreNotificationStream$ = interval(100)
      .pipe(
        filter(() => this.notificationHistory.observed),
        tap(() => {
          const storedNotifications = this.retrieveNotifications();
          this.deleteNotifications();
          storedNotifications.forEach(notification => {
            this.emitNotification(notification);
          });
          restoreNotificationStream$.unsubscribe();
        }),
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
