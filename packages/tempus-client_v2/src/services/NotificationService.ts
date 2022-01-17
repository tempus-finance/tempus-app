import { ethers, BigNumber } from 'ethers';
import { Observable, ReplaySubject, Subject, interval, tap, filter } from 'rxjs';
import format from 'date-fns/format';
import { v1 as uuid } from 'uuid';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces/Token';
import { ProtocolName } from '../interfaces/ProtocolName';
import { TempusPool } from '../interfaces/TempusPool';
import { Notification, NotificationCategory, NotificationLevel } from '../interfaces/Notification';
import { capitalize } from '../utils/capitalizeString';
import getConfig from '../utils/getConfig';
import NumberUtils from './NumberUtils';
import StorageService from './StorageService';

const NOTIFICATIONS_KEY = 'notifications';

class NotificationService {
  private notificationQueue: Subject<Notification> = new Subject<Notification>();
  private notificationHistory: ReplaySubject<Notification> = new ReplaySubject<Notification>(5);

  constructor(private storageService: StorageService) {
    this.restoreNotifications();
  }

  warn(category: NotificationCategory, title: string, content: string, link?: string, linkText?: string) {
    this.addToQueue(category, NotificationLevel.WARNING, title, content, link, linkText);
  }

  notify(category: NotificationCategory, title: string, content: string, link?: string, linkText?: string) {
    this.addToQueue(category, NotificationLevel.INFO, title, content, link, linkText);
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
    category: NotificationCategory,
    level: NotificationLevel,
    title: string,
    content: string,
    link?: string,
    linkText?: string,
  ) {
    const notification = {
      category,
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

export const generateEtherscanLink = (tx: string) => {
  const config = getConfig();

  if (config.networkName === 'homestead') {
    return `https://etherscan.io/tx/${tx}`;
  }
  return `https://${config.networkName}.etherscan.io/tx/${tx}`;
};

export const generatePoolNotificationInfo = (ticker: Ticker, protocol: ProtocolName, maturityDate: Date) => {
  return `${ticker} via ${capitalize(protocol)}
  ${format(maturityDate, 'dd MMMM yyyy')}`;
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

export const generateNotificationInfo = (
  action: string,
  actionDescription: string,
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  switch (action) {
    case 'Deposit':
      return getDepositNotificationContent(receipt, transaction, userWallet, actionDescription, staticPoolData);
    case 'Withdraw':
      return getWithdrawNotificationContent(receipt, userWallet, staticPoolData);
    case 'Mint':
      return getMintNotificationContent(receipt, transaction, userWallet, staticPoolData);
    case 'Swap':
      return getSwapNotificationContent(receipt, userWallet, staticPoolData);
    case 'Liquidity Deposit':
      return getLiquidityDepositNotificationContent(receipt, userWallet, staticPoolData);
    case 'Liquidity Withdrawal':
      return getLiquidityWithdrawalNotificationContent(receipt, userWallet, staticPoolData);
    case 'Redeem':
      return getRedeemNotificationContent(receipt, userWallet, staticPoolData);
  }
};

const getDepositNotificationContent = (
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  actionDescription: string,
  staticPoolData: TempusPool,
) => {
  let tokenSentPrecision: number | null = null;
  let tokenSentTicker: Ticker | null = null;
  let tokenSentAmount = BigNumber.from('0');
  let principalsReceived = BigNumber.from('0');
  let lpTokensReceived = BigNumber.from('0');

  // ETH was transferred
  if (!transaction.value.isZero()) {
    tokenSentAmount = transaction.value;
    tokenSentTicker = staticPoolData.backingToken;
    tokenSentPrecision = staticPoolData.tokenPrecision.backingToken;
  }

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // User sent backing token
        if (staticPoolData.backingTokenAddress.toLowerCase() === log.address.toLowerCase()) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = staticPoolData.backingToken;
          tokenSentPrecision = staticPoolData.tokenPrecision.backingToken;
        }
        // User sent yield bearing token
        if (staticPoolData.yieldBearingTokenAddress.toLowerCase() === log.address.toLowerCase()) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = staticPoolData.yieldBearingToken;
          tokenSentPrecision = staticPoolData.tokenPrecision.yieldBearingToken;
        }
      }

      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Principals received amount
        if (staticPoolData.principalsAddress.toLowerCase() === log.address.toLowerCase()) {
          principalsReceived = logData.args.value;
        }
        // LP Tokens received amount
        if (staticPoolData.ammAddress.toLowerCase() === log.address.toLowerCase()) {
          lpTokensReceived = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentAmountFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(tokenSentAmount, tokenSentPrecision || 18),
    staticPoolData.decimalsForUI,
  );
  const principalsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(principalsReceived, staticPoolData.tokenPrecision.principals),
    staticPoolData.decimalsForUI,
  );
  const lpTokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(lpTokensReceived, staticPoolData.tokenPrecision.yields),
    staticPoolData.decimalsForUI,
  );

  if (actionDescription === 'Fixed Yield') {
    return `${tokenSentAmountFormatted} ${tokenSentTicker} to
    ${principalsReceivedFormatted} Principals
    ${actionDescription}
  
    ${generatePoolNotificationInfo(
      staticPoolData.backingToken,
      staticPoolData.protocol,
      new Date(staticPoolData.maturityDate),
    )}`;
  } else if (actionDescription === 'Variable Yield') {
    return `${tokenSentAmountFormatted} ${tokenSentTicker} to
    ${principalsReceivedFormatted} Principals and
    ${lpTokensReceivedFormatted} LP Tokens
    ${actionDescription}
    
    ${generatePoolNotificationInfo(
      staticPoolData.backingToken,
      staticPoolData.protocol,
      new Date(staticPoolData.maturityDate),
    )}`;
  }
};

const getWithdrawNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let principalsSent = BigNumber.from('0');
  let yieldsSent = BigNumber.from('0');
  let lpTokensSent = BigNumber.from('0');
  let tokensReceived = BigNumber.from('0');
  let tokenReceivedTicker: Ticker | null = null;

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // Amount of principals sent
        if (log.address === staticPoolData.principalsAddress) {
          principalsSent = logData.args.value;
        }
        // Amount of yields sent
        if (log.address === staticPoolData.yieldsAddress) {
          yieldsSent = logData.args.value;
        }
        // Amount of LP Tokens sent
        if (log.address === staticPoolData.ammAddress) {
          lpTokensSent = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received backing tokens
        if (log.address === staticPoolData.backingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.backingToken;
        }
        // User received yield bearing tokens
        if (log.address === staticPoolData.yieldBearingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.yieldBearingToken;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const principalsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(principalsSent),
    staticPoolData.decimalsForUI,
  );
  const yieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(yieldsSent),
    staticPoolData.decimalsForUI,
  );
  const lpTokensSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(lpTokensSent),
    staticPoolData.decimalsForUI,
  );
  const tokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokensReceived),
    staticPoolData.decimalsForUI,
  );

  return `${principalsSentFormatted} Principals,
  ${yieldsSentFormatted} Yields,
  ${lpTokensSentFormatted} LP Tokens to
  ${tokensReceivedFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

/**
 * Generates notification message for Mint action that includes number of Principals and Yields minted.
 */
const getMintNotificationContent = (
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let tokenSentPrecision: number | null = null;
  let tokenSentTicker: Ticker | null = null;
  let tokenSentAmount = BigNumber.from('0');
  let principalsMinted = BigNumber.from('0');
  let yieldsMinted = BigNumber.from('0');

  // ETH was transferred
  if (!transaction.value.isZero()) {
    tokenSentAmount = transaction.value;
    tokenSentTicker = staticPoolData.backingToken;
    tokenSentPrecision = staticPoolData.tokenPrecision.backingToken;
  }

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // User sent backing token
        if (staticPoolData.backingTokenAddress.toLowerCase() === log.address.toLowerCase()) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = staticPoolData.backingToken;
          tokenSentPrecision = staticPoolData.tokenPrecision.backingToken;
        }
        // User sent yield bearing token
        if (staticPoolData.yieldBearingTokenAddress.toLowerCase() === log.address.toLowerCase()) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = staticPoolData.yieldBearingToken;
          tokenSentPrecision = staticPoolData.tokenPrecision.yieldBearingToken;
        }
      }

      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Principals minted amount
        if (staticPoolData.principalsAddress.toLowerCase() === log.address.toLowerCase()) {
          principalsMinted = logData.args.value;
        }
        // Yields minted amount
        if (staticPoolData.yieldsAddress.toLowerCase() === log.address.toLowerCase()) {
          yieldsMinted = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentAmountFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(tokenSentAmount, tokenSentPrecision || 18),
    staticPoolData.decimalsForUI,
  );
  const principalsMintedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(principalsMinted, staticPoolData.tokenPrecision.principals),
    staticPoolData.decimalsForUI,
  );
  const yieldsMintedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(yieldsMinted, staticPoolData.tokenPrecision.yields),
    staticPoolData.decimalsForUI,
  );

  return `${tokenSentAmountFormatted} ${tokenSentTicker} to
  ${principalsMintedFormatted} Principals and
  ${yieldsMintedFormatted} Yields

  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

/**
 * Generates notification message for Swap action that includes number of Principals and Yields swapped.
 */
const getSwapNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let tokenSentTicker: Ticker | null = null;
  let tokenSentValue: BigNumber = BigNumber.from('0');
  let tokenReceivedTicker: Ticker | null = null;
  let tokenReceivedValue: BigNumber = BigNumber.from('0');

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // User sent principals
        if (log.address === staticPoolData.principalsAddress) {
          tokenSentTicker = 'Principals';
          tokenSentValue = logData.args.value;
        }
        // User sent yields
        if (log.address === staticPoolData.yieldsAddress) {
          tokenSentTicker = 'Yields';
          tokenSentValue = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received principals
        if (log.address === staticPoolData.principalsAddress) {
          tokenReceivedTicker = 'Principals';
          tokenReceivedValue = logData.args.value;
        }
        // User received yields
        if (log.address === staticPoolData.yieldsAddress) {
          tokenReceivedTicker = 'Yields';
          tokenReceivedValue = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentValueFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokenSentValue),
    staticPoolData.decimalsForUI,
  );
  const tokenReceivedValueFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokenReceivedValue),
    staticPoolData.decimalsForUI,
  );

  return `${tokenSentValueFormatted} ${tokenSentTicker} to
  ${tokenReceivedValueFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getLiquidityDepositNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let amountOfPrincipalsSent = BigNumber.from('0');
  let amountOfYieldsSent = BigNumber.from('0');
  let amountOfLPTokensReceived = BigNumber.from('0');

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // Amount of principals user sent
        if (log.address === staticPoolData.principalsAddress) {
          amountOfPrincipalsSent = logData.args.value;
        }
        // Amount of yields user sent
        if (log.address === staticPoolData.yieldsAddress) {
          amountOfYieldsSent = logData.args.value;
        }
      }
      // Amount of LP tokens user received
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        amountOfLPTokensReceived = logData.args.value;
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const amountOfPrincipalsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfPrincipalsSent),
    staticPoolData.decimalsForUI,
  );
  const amountOfYieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfYieldsSent),
    staticPoolData.decimalsForUI,
  );
  const amountOfLPTokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfLPTokensReceived),
    staticPoolData.decimalsForUI,
  );

  return `${amountOfPrincipalsSentFormatted} Principals and
  ${amountOfYieldsSentFormatted} Yields to
  ${amountOfLPTokensReceivedFormatted} LP Tokens
  
  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getLiquidityWithdrawalNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let amountOfLPTokensSent = BigNumber.from('0');
  let amountOfPrincipalsReceived = BigNumber.from('0');
  let amountOfYieldsReceived = BigNumber.from('0');

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // Amount of LP Tokens user sent
        if (log.address === staticPoolData.ammAddress) {
          amountOfLPTokensSent = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Amount of Principals user received
        if (log.address === staticPoolData.principalsAddress) {
          amountOfPrincipalsReceived = logData.args.value;
        }
        // Amount of Principals user received
        if (log.address === staticPoolData.yieldsAddress) {
          amountOfYieldsReceived = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const amountOfLPTokensSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(amountOfLPTokensSent, staticPoolData.tokenPrecision.lpTokens),
    staticPoolData.decimalsForUI,
  );
  const amountOfPrincipalsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(amountOfPrincipalsReceived, staticPoolData.tokenPrecision.principals),
    staticPoolData.decimalsForUI,
  );
  const amountOfYieldsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(amountOfYieldsReceived, staticPoolData.tokenPrecision.yields),
    staticPoolData.decimalsForUI,
  );

  return `${amountOfLPTokensSentFormatted} LP Tokens to
  ${amountOfPrincipalsReceivedFormatted} Principals and
  ${amountOfYieldsReceivedFormatted} Yields
  
  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getRedeemNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  let primitivesSent = BigNumber.from('0');
  let tokensReceived = BigNumber.from('0');
  let tokenReceivedTicker: Ticker | null = null;

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // Amount of Primitives user sent
        primitivesSent = logData.args.value;
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received backing tokens
        if (log.address === staticPoolData.backingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.backingToken;
        }
        // User received yield bearing tokens
        if (log.address === staticPoolData.yieldBearingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.yieldBearingToken;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const primitivesSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(primitivesSent),
    staticPoolData.decimalsForUI,
  );
  const tokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokensReceived),
    staticPoolData.decimalsForUI,
  );

  return `${primitivesSentFormatted} Principals and Yields to
  ${tokensReceivedFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

export default NotificationService;
