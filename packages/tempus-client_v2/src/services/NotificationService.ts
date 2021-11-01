import { ethers, BigNumber } from 'ethers';
import { Observable, Subject } from 'rxjs';
import format from 'date-fns/format';
import { v1 as uuid } from 'uuid';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces/Token';
import { ProtocolName } from '../interfaces/ProtocolName';
import { TempusPool } from '../interfaces/TempusPool';
import { capitalize } from '../utils/capitalizeString';
import getConfig from '../utils/getConfig';
import NumberUtils from './NumberUtils';

export enum NotificationLevel {
  WARNING = 'warning',
  INFO = 'info',
}

export type Notification = {
  id: string;
  level: NotificationLevel;
  title: string;
  content: string;
  link?: string;
  linkText?: string;
};

// TODO add tests
class NotificationService {
  private notificationQueue: Subject<Notification> = new Subject<Notification>();

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
    this.notificationQueue.next({ level, title, content, link, linkText, id: uuid() });
  }
}

export const generateEtherscanLink = (tx: string) => {
  const config = getConfig();

  // TODO - No need to specify network name for mainnet
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
  tempusPool: TempusPool,
) => {
  switch (action) {
    case 'Deposit':
      return getDepositNotificationContent(receipt, transaction, userWallet, tempusPool, actionDescription);
    case 'Withdraw':
      return getWithdrawNotificationContent(receipt, userWallet, tempusPool);
    case 'Mint':
      return getMintNotificationContent(receipt, transaction, userWallet, tempusPool);
    case 'Swap':
      return getSwapNotificationContent(receipt, userWallet, tempusPool);
    case 'Liquidity Deposit':
      return getLiquidityDepositNotificationContent(receipt, userWallet, tempusPool);
    case 'Liquidity Withdrawal':
      return getLiquidityWithdrawalNotificationContent(receipt, userWallet, tempusPool);
    case 'Redeem':
      return getRedeemNotificationContent(receipt, userWallet, tempusPool);
  }
};

const getDepositNotificationContent = (
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  tempusPool: TempusPool,
  actionDescription: string,
) => {
  let tokenSentTicker: Ticker | null = null;
  let tokenSentAmount = BigNumber.from('0');
  let principalsReceived = BigNumber.from('0');
  let lpTokensReceived = BigNumber.from('0');

  // ETH was transferred
  if (!transaction.value.isZero()) {
    tokenSentAmount = transaction.value;
    tokenSentTicker = tempusPool.backingToken;
  }

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // User sent backing token
        if (tempusPool.backingTokenAddress === log.address) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = tempusPool.backingToken;
        }
        // User sent yield bearing token
        if (tempusPool.yieldBearingTokenAddress === log.address) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = tempusPool.yieldBearingToken;
        }
      }

      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Principals received amount
        if (tempusPool.principalsAddress === log.address) {
          principalsReceived = logData.args.value;
        }
        // LP Tokens received amount
        if (tempusPool.ammAddress === log.address) {
          lpTokensReceived = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentAmountFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokenSentAmount),
    tempusPool.decimalsForUI,
  );
  const principalsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(principalsReceived),
    tempusPool.decimalsForUI,
  );
  const lpTokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(lpTokensReceived),
    tempusPool.decimalsForUI,
  );

  if (actionDescription === 'Fixed Yield') {
    return `${tokenSentAmountFormatted} ${tokenSentTicker} to
    ${principalsReceivedFormatted} Principals
    ${actionDescription}
  
    ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
  } else if (actionDescription === 'Variable Yield') {
    return `${tokenSentAmountFormatted} ${tokenSentTicker} to
    ${principalsReceivedFormatted} Principals and
    ${lpTokensReceivedFormatted} LP Tokens
    ${actionDescription}
    
    ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
  }
};

const getWithdrawNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  tempusPool: TempusPool,
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
        if (log.address === tempusPool.principalsAddress) {
          principalsSent = logData.args.value;
        }
        // Amount of yields sent
        if (log.address === tempusPool.yieldsAddress) {
          yieldsSent = logData.args.value;
        }
        // Amount of LP Tokens sent
        if (log.address === tempusPool.ammAddress) {
          lpTokensSent = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received backing tokens
        if (log.address === tempusPool.backingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = tempusPool.backingToken;
        }
        // User received yield bearing tokens
        if (log.address === tempusPool.yieldBearingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = tempusPool.yieldBearingToken;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const principalsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(principalsSent),
    tempusPool.decimalsForUI,
  );
  const yieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(yieldsSent),
    tempusPool.decimalsForUI,
  );
  const lpTokensSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(lpTokensSent),
    tempusPool.decimalsForUI,
  );
  const tokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokensReceived),
    tempusPool.decimalsForUI,
  );

  return `${principalsSentFormatted} Principals,
  ${yieldsSentFormatted} Yields,
  ${lpTokensSentFormatted} LP Tokens to
  ${tokensReceivedFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

/**
 * Generates notification message for Mint action that includes number of Principals and Yields minted.
 */
const getMintNotificationContent = (
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  tempusPool: TempusPool,
) => {
  let tokenSentTicker: Ticker | null = null;
  let tokenSentAmount = BigNumber.from('0');
  let principalsMinted = BigNumber.from('0');
  let yieldsMinted = BigNumber.from('0');

  // ETH was transferred
  if (!transaction.value.isZero()) {
    tokenSentAmount = transaction.value;
    tokenSentTicker = tempusPool.backingToken;
  }

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // User sent backing token
        if (tempusPool.backingTokenAddress === log.address) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = tempusPool.backingToken;
        }
        // User sent yield bearing token
        if (tempusPool.yieldBearingTokenAddress === log.address) {
          tokenSentAmount = logData.args.value;
          tokenSentTicker = tempusPool.yieldBearingToken;
        }
      }

      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Principals minted amount
        if (tempusPool.principalsAddress === log.address) {
          principalsMinted = logData.args.value;
        }
        // Yields minted amount
        if (tempusPool.yieldsAddress === log.address) {
          yieldsMinted = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentAmountFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokenSentAmount),
    tempusPool.decimalsForUI,
  );
  const principalsMintedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(principalsMinted),
    tempusPool.decimalsForUI,
  );
  const yieldsMintedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(yieldsMinted),
    tempusPool.decimalsForUI,
  );

  return `${tokenSentAmountFormatted} ${tokenSentTicker} to
  ${principalsMintedFormatted} Principals and
  ${yieldsMintedFormatted} Yields

  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

/**
 * Generates notification message for Swap action that includes number of Principals and Yields swapped.
 */
const getSwapNotificationContent = (receipt: ethers.ContractReceipt, userWallet: string, tempusPool: TempusPool) => {
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
        if (log.address === tempusPool.principalsAddress) {
          tokenSentTicker = 'Principals';
          tokenSentValue = logData.args.value;
        }
        // User sent yields
        if (log.address === tempusPool.yieldsAddress) {
          tokenSentTicker = 'Yields';
          tokenSentValue = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received principals
        if (log.address === tempusPool.principalsAddress) {
          tokenReceivedTicker = 'Principals';
          tokenReceivedValue = logData.args.value;
        }
        // User received yields
        if (log.address === tempusPool.yieldsAddress) {
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
    tempusPool.decimalsForUI,
  );
  const tokenReceivedValueFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokenReceivedValue),
    tempusPool.decimalsForUI,
  );

  return `${tokenSentValueFormatted} ${tokenSentTicker} to
  ${tokenReceivedValueFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

const getLiquidityDepositNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  tempusPool: TempusPool,
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
        if (log.address === tempusPool.principalsAddress) {
          amountOfPrincipalsSent = logData.args.value;
        }
        // Amount of yields user sent
        if (log.address === tempusPool.yieldsAddress) {
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
    tempusPool.decimalsForUI,
  );
  const amountOfYieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfYieldsSent),
    tempusPool.decimalsForUI,
  );
  const amountOfLPTokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfLPTokensReceived),
    tempusPool.decimalsForUI,
  );

  return `${amountOfPrincipalsSentFormatted} Principals and
  ${amountOfYieldsSentFormatted} Yields to
  ${amountOfLPTokensReceivedFormatted} LP Tokens
  
  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

const getLiquidityWithdrawalNotificationContent = (
  receipt: ethers.ContractReceipt,
  userWallet: string,
  tempusPool: TempusPool,
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
        if (log.address === tempusPool.ammAddress) {
          amountOfLPTokensSent = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // Amount of Principals user received
        if (log.address === tempusPool.principalsAddress) {
          amountOfPrincipalsReceived = logData.args.value;
        }
        // Amount of Principals user received
        if (log.address === tempusPool.yieldsAddress) {
          amountOfYieldsReceived = logData.args.value;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const amountOfLPTokensSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfLPTokensSent),
    tempusPool.decimalsForUI,
  );
  const amountOfPrincipalsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfPrincipalsReceived),
    tempusPool.decimalsForUI,
  );
  const amountOfYieldsReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(amountOfYieldsReceived),
    tempusPool.decimalsForUI,
  );

  return `${amountOfLPTokensSentFormatted} LP Tokens to
  ${amountOfPrincipalsReceivedFormatted} Principals and
  ${amountOfYieldsReceivedFormatted} Yields
  
  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

const getRedeemNotificationContent = (receipt: ethers.ContractReceipt, userWallet: string, tempusPool: TempusPool) => {
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
        if (log.address === tempusPool.backingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = tempusPool.backingToken;
        }
        // User received yield bearing tokens
        if (log.address === tempusPool.yieldBearingTokenAddress) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = tempusPool.yieldBearingToken;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const primitivesSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(primitivesSent),
    tempusPool.decimalsForUI,
  );
  const tokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatEther(tokensReceived),
    tempusPool.decimalsForUI,
  );

  return `${primitivesSentFormatted} Principals and Yields to
  ${tokensReceivedFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(tempusPool.backingToken, tempusPool.protocol, new Date(tempusPool.maturityDate))}`;
};

export default NotificationService;
