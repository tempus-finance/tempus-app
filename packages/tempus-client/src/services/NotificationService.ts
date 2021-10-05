import { format } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { ProtocolName, Ticker } from '../interfaces';
import { capitalize } from '../utils/capitalize-string';
import getConfig from '../utils/get-config';

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

export const generateEtherscanLink = (tx: string) => {
  const config = getConfig();

  // TODO - No need to specify network name for mainnet
  return `https://${config.networkName}.etherscan.io/tx/${tx}`;
};

export const getTokenApprovalNotification = (
  tokenApproved: Ticker,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  return `${tokenApproved}
    ${backingToken} via ${capitalize(protocol)}
    ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export const getDepositNotification = (
  kind: string,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  return `${kind}
  ${backingToken} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export const getWithdrawNotification = (backingToken: Ticker, protocol: ProtocolName, maturityDate: Date) => {
  return `${backingToken} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export const getMintNotification = (
  estimatedTokens: string,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  return `est. ${estimatedTokens} Principals
  est. ${estimatedTokens} Yields

  ${backingToken} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export const getSwapNotification = (
  tokenFrom: string,
  fromAmount: string,
  tokenTo: Ticker,
  toAmount: string,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  return `${fromAmount} ${tokenFrom} to
  ${toAmount} ${tokenTo}

  ${backingToken} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export const getPoolLiquidityNotification = (backingToken: Ticker, protocol: ProtocolName, maturityDate: Date) => {
  return `${backingToken} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
};

export default NotificationService;
