import { Observable, Subject } from 'rxjs';

export enum NotificationLevel {
  WARNING = 'warning',
  INFO = 'info',
}

export type Notification = {
  id: number;
  level: NotificationLevel;
  title: string;
  content: string;
  link?: string;
  linkText?: string;
};

// TODO add tests
class NotificationService {
  private notificationQueue: Subject<Notification> = new Subject<Notification>();
  private nextId: number = 0;

  warn(title: string, content: string, link?: string, linkText?: string) {
    this.addToQueue(NotificationLevel.WARNING, title, content, link, linkText);
  }

  notify(title: string, content: string, link?: string, linkText?: string) {
    this.addToQueue(NotificationLevel.INFO, title, content, link, linkText);
  }

  getNextItem(): Observable<Notification> {
    return this.notificationQueue.asObservable();
  }

  private addToQueue(level: NotificationLevel, title: string, content: string, link?: string, linkText?: string) {
    this.notificationQueue.next({ level, title, content, link, linkText, id: this.nextId++ });
  }
}

export default NotificationService;
