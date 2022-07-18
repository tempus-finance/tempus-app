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

export interface TransactionData {
  transactionType: 'approve' | 'deposit' | 'withdraw';
  chain: Chain;
  poolAddress?: string;
  tokenAmount: string; // use string to be better serlizable in storage
  tokenAddress: string;
  txnId: string;
}
export type NotificationData = TransactionData; // in future it will be TransactionData | WalletData | ServiceData

export interface Notification {
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
  data?: NotificationData;
  dismissed: boolean;
}

export interface NotificationInput {
  chain: Chain;
  category: NotificationCategory;
  status: NotificationStatus;
  title: NotificationText;
  content: NotificationText;
  link?: string;
  linkText?: NotificationText;
  refId?: string;
  data?: NotificationData;
}
