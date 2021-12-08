export type NotificationCategory = 'Transaction' | 'Wallet' | 'Service';

export enum NotificationLevel {
  WARNING = 'warning',
  INFO = 'info',
}

export type Notification = {
  category: NotificationCategory;
  id: string;
  timestamp: number;
  level: NotificationLevel;
  title: string;
  content: string;
  link?: string;
  linkText?: string;
};
