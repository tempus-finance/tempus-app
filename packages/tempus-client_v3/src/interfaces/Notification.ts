import { Chain } from 'tempus-core-services';

export type NotificationCategory = 'Transaction' | 'Wallet' | 'Service';
export type NotificationStatus = 'pending' | 'success' | 'failure';

export enum NotificationLevel {
  WARNING = 'warning',
  INFO = 'info',
}

export type NotificationText =
  | string
  | {
      key: string;
      data?: {
        [key in string]: string | number;
      };
    };

export type Notification = {
  category: NotificationCategory;
  status: NotificationStatus;
  chain: Chain;
  id: string;
  timestamp: number;
  level: NotificationLevel;
  title: NotificationText;
  content: NotificationText;
  link?: string;
  linkText?: NotificationText;
  refId?: string;
  dismissed: boolean;
};

export type NotificationInput = {
  chain: Chain;
  category: NotificationCategory;
  status: NotificationStatus;
  title: NotificationText;
  content: NotificationText;
  link?: string;
  linkText?: NotificationText;
  refId?: string;
};
