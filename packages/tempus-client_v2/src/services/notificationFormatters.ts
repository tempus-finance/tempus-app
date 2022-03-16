import { ethers, BigNumber } from 'ethers';
import { format } from 'date-fns';
import { CONSTANTS } from 'tempus-core-services';
import ERC20ABI from '../abi/ERC20.json';
import { Ticker } from '../interfaces/Token';
import { ProtocolName } from '../interfaces/ProtocolName';
import { TempusPool } from '../interfaces/TempusPool';
import { Chain, prettifyChainName } from '../interfaces/Chain';
import { Locale } from '../interfaces/Locale';
import getText from '../localisation/getText';
import { capitalize } from '../utils/capitalizeString';
import { getChainConfig } from '../utils/getConfig';
import NumberUtils from './NumberUtils';

const { BAL_SLIPPAGE_ERROR_CODE } = CONSTANTS;

interface NotificationContent {
  chain: Chain;
  locale: Locale;
  receipt: ethers.ContractReceipt;
  userWallet: string;
  staticPoolData: TempusPool;
  notificationDateTime: string;
}

export const generateNotificationInfo = (
  chain: Chain,
  locale: Locale,
  action: string,
  actionDescription: string,
  receipt: ethers.ContractReceipt,
  transaction: ethers.ContractTransaction,
  userWallet: string,
  staticPoolData: TempusPool,
) => {
  const notificationDateTime = format(new Date(), 'kk:mm:ss dd-MMMM-yyyy', { locale: locale.dateLocale });
  switch (action) {
    case 'Deposit':
      return getDepositNotificationContent({
        chain,
        locale,
        receipt,
        transaction,
        userWallet,
        actionDescription,
        staticPoolData,
        notificationDateTime,
      });
    case 'Withdraw':
      return getWithdrawNotificationContent({
        chain,
        locale,
        receipt,
        userWallet,
        staticPoolData,
        notificationDateTime,
      });
    case 'Mint':
      return getMintNotificationContent({
        chain,
        locale,
        receipt,
        transaction,
        userWallet,
        staticPoolData,
        notificationDateTime,
      });
    case 'Swap':
      return getSwapNotificationContent({ chain, locale, receipt, userWallet, staticPoolData, notificationDateTime });
    case 'Liquidity Deposit':
      return getLiquidityDepositNotificationContent({
        chain,
        locale,
        receipt,
        userWallet,
        staticPoolData,
        notificationDateTime,
      });
    case 'Liquidity Withdrawal':
      return getLiquidityWithdrawalNotificationContent({
        chain,
        locale,
        receipt,
        userWallet,
        staticPoolData,
        notificationDateTime,
      });
    case 'Redeem':
      return getRedeemNotificationContent({
        chain,
        locale,
        receipt,
        userWallet,
        staticPoolData,
        notificationDateTime,
      });
  }
};

export const generateFailedTransactionInfo = (chain: Chain, locale: Locale, poolData: TempusPool, error: any) => {
  let failReason = '';
  if (error?.data?.message?.includes(BAL_SLIPPAGE_ERROR_CODE)) {
    failReason = `${getText('slippageError', locale)}\n\n`;
  }

  return `${failReason}${generatePoolNotificationInfo(
    chain,
    locale,
    poolData.backingToken,
    poolData.protocol,
    new Date(poolData.maturityDate),
  )}`;
};

export const generateEtherscanLink = (tx: string, chainName: Chain) => {
  const config = getChainConfig(chainName);

  if (config.networkName === 'homestead') {
    return `https://etherscan.io/tx/${tx}`;
  }
  if (config.networkName === 'fantom-mainnet') {
    return `https://ftmscan.com/tx/${tx}`;
  }
  return `https://${config.networkName}.etherscan.io/tx/${tx}`;
};

export const generatePoolNotificationInfo = (
  chain: Chain,
  locale: Locale,
  ticker: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  const notificationDateTime = format(new Date(), 'kk:mm:ss dd-MMMM-yyyy', { locale: locale.dateLocale });
  return `${notificationDateTime}
  ${prettifyChainName(chain)} - ${ticker} ${getText('via', locale)} ${capitalize(protocol)}
  ${getText('maturityXxx', locale, { date: format(maturityDate, 'dd MMMM yyyy', { locale: locale.dateLocale }) })}`;
};

export const getTokenApprovalNotification = (
  chain: Chain,
  locale: Locale,
  tokenApproved: Ticker,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
) => {
  // Quick fix to show Capitals instead of Principals in the notification
  // TODO - Properly change Principals to Capitals in the Token interface.
  const notificationDateTime = format(new Date(), 'kk:mm:ss dd-MMMM-yyyy', { locale: locale.dateLocale });

  return `${notificationDateTime}
  ${prettifyChainName(chain)} - ${tokenApproved === 'Principals' ? 'Capitals' : tokenApproved}
    ${backingToken} ${getText('via', locale)} ${capitalize(protocol)}
    ${getText('maturity', locale)} ${format(maturityDate, 'dd MMMM yyyy', { locale: locale.dateLocale })}`;
};

const getDepositNotificationContent = ({
  chain,
  locale,
  receipt,
  transaction,
  userWallet,
  actionDescription,
  staticPoolData,
  notificationDateTime,
}: NotificationContent & { actionDescription: string; transaction: ethers.ContractTransaction }) => {
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
    ethers.utils.formatUnits(lpTokensReceived, staticPoolData.tokenPrecision.lpTokens),
    staticPoolData.decimalsForUI,
  );

  if (actionDescription === 'Fixed Yield') {
    return `${notificationDateTime}
    ${tokenSentAmountFormatted} ${tokenSentTicker} ${getText('to', locale)}
    ${getText('xxxPrincipals', locale, { token: principalsReceivedFormatted })}
    ${actionDescription}
  
    ${generatePoolNotificationInfo(
      chain,
      locale,
      staticPoolData.backingToken,
      staticPoolData.protocol,
      new Date(staticPoolData.maturityDate),
    )}`;
  } else if (actionDescription === 'Variable Yield') {
    return `${notificationDateTime}
    ${tokenSentAmountFormatted} ${tokenSentTicker} ${getText('to', locale)}
    ${getText('xxxPrincipals', locale, { token: principalsReceivedFormatted })} ${getText('and', locale)}
    ${getText('xxxLpTokens', locale, { token: lpTokensReceivedFormatted })}
    ${actionDescription}

    ${generatePoolNotificationInfo(
      chain,
      locale,
      staticPoolData.backingToken,
      staticPoolData.protocol,
      new Date(staticPoolData.maturityDate),
    )}`;
  }
};

const getWithdrawNotificationContent = ({
  chain,
  locale,
  receipt,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent) => {
  let principalsSent = BigNumber.from('0');
  let yieldsSent = BigNumber.from('0');
  let lpTokensSent = BigNumber.from('0');
  let tokensReceived = BigNumber.from('0');
  let tokenReceivedTicker: Ticker | null = null;
  let tokenReceivedPrecision: number | null = null;

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === userWallet) {
        // Amount of principals sent
        if (log.address.toLowerCase() === staticPoolData.principalsAddress.toLowerCase()) {
          principalsSent = logData.args.value;
        }
        // Amount of yields sent
        if (log.address.toLowerCase() === staticPoolData.yieldsAddress.toLowerCase()) {
          yieldsSent = logData.args.value;
        }
        // Amount of LP Tokens sent
        if (log.address.toLowerCase() === staticPoolData.ammAddress.toLowerCase()) {
          lpTokensSent = logData.args.value;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received backing tokens
        if (log.address.toLowerCase() === staticPoolData.backingTokenAddress.toLowerCase()) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.backingToken;
          tokenReceivedPrecision = staticPoolData.tokenPrecision.backingToken;
        }
        // User received yield bearing tokens
        if (log.address.toLowerCase() === staticPoolData.yieldBearingTokenAddress.toLowerCase()) {
          tokensReceived = logData.args.value;
          tokenReceivedTicker = staticPoolData.yieldBearingToken;
          tokenReceivedPrecision = staticPoolData.tokenPrecision.yieldBearingToken;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const principalsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(principalsSent, staticPoolData.tokenPrecision.principals),
    staticPoolData.decimalsForUI,
  );
  const yieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(yieldsSent, staticPoolData.tokenPrecision.yields),
    staticPoolData.decimalsForUI,
  );
  const lpTokensSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(lpTokensSent, staticPoolData.tokenPrecision.lpTokens),
    staticPoolData.decimalsForUI,
  );
  const tokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(tokensReceived, tokenReceivedPrecision || 18),
    staticPoolData.decimalsForUI,
  );

  return `${notificationDateTime}
  ${getText('xxxPrincipals', locale, { token: principalsSentFormatted })},
  ${getText('xxxYields', locale, { token: yieldsSentFormatted })},
  ${getText('xxxLpTokens', locale, { token: lpTokensSentFormatted })} ${getText('to', locale)}
  ${tokensReceivedFormatted} ${tokenReceivedTicker}

  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

/**
 * Generates notification message for Mint action that includes number of Principals and Yields minted.
 */
const getMintNotificationContent = ({
  chain,
  locale,
  receipt,
  transaction,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent & { transaction: ethers.ContractTransaction }) => {
  let tokenSentPrecision: number | null = null;
  let tokenSentTicker: Ticker | null = null;
  let tokenSentAmount = BigNumber.from('0');
  let principalsMinted = BigNumber.from('0');
  let yieldsMinted = BigNumber.from('0');

  // ETH was transferred
  if (transaction && !transaction.value.isZero()) {
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

  return `${notificationDateTime}
  ${tokenSentAmountFormatted} ${tokenSentTicker} ${getText('to', locale)}
  ${getText('xxxPrincipals', locale, { token: principalsMintedFormatted })} ${getText('and', locale)}
  ${getText('xxxYields', locale, { token: yieldsMintedFormatted })}

  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

/**
 * Generates notification message for Swap action that includes number of Principals and Yields swapped.
 */
const getSwapNotificationContent = ({
  chain,
  locale,
  receipt,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent) => {
  let tokenSentPrecision: number | null = null;
  let tokenSentTicker: Ticker | null = null;
  let tokenSentValue: BigNumber = BigNumber.from('0');
  let tokenReceivedPrecision: number | null = null;
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
          tokenSentPrecision = staticPoolData.tokenPrecision.principals;
        }
        // User sent yields
        if (log.address === staticPoolData.yieldsAddress) {
          tokenSentTicker = 'Yields';
          tokenSentValue = logData.args.value;
          tokenSentPrecision = staticPoolData.tokenPrecision.yields;
        }
      }
      if (logData.name === 'Transfer' && logData.args.to === userWallet) {
        // User received principals
        if (log.address === staticPoolData.principalsAddress) {
          tokenReceivedTicker = 'Principals';
          tokenReceivedValue = logData.args.value;
          tokenReceivedPrecision = staticPoolData.tokenPrecision.principals;
        }
        // User received yields
        if (log.address === staticPoolData.yieldsAddress) {
          tokenReceivedTicker = 'Yields';
          tokenReceivedValue = logData.args.value;
          tokenReceivedPrecision = staticPoolData.tokenPrecision.yields;
        }
      }
    } catch (error) {
      console.log('No matching event found in transaction receipt log, skipping log.');
    }
  });

  const tokenSentValueFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(tokenSentValue, tokenSentPrecision || 18),
    staticPoolData.decimalsForUI,
  );
  const tokenReceivedValueFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(tokenReceivedValue, tokenReceivedPrecision || 18),
    staticPoolData.decimalsForUI,
  );

  return `${notificationDateTime}
  ${tokenSentValueFormatted} ${tokenSentTicker} ${getText('to', locale)}
  ${tokenReceivedValueFormatted} ${tokenReceivedTicker}

  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getLiquidityDepositNotificationContent = ({
  chain,
  locale,
  receipt,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent) => {
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
    ethers.utils.formatUnits(amountOfPrincipalsSent, staticPoolData.tokenPrecision.principals),
    staticPoolData.decimalsForUI,
  );
  const amountOfYieldsSentFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(amountOfYieldsSent, staticPoolData.tokenPrecision.yields),
    staticPoolData.decimalsForUI,
  );
  const amountOfLPTokensReceivedFormatted = NumberUtils.formatToCurrency(
    ethers.utils.formatUnits(amountOfLPTokensReceived, staticPoolData.tokenPrecision.lpTokens || 18),
    staticPoolData.decimalsForUI,
  );

  return `${notificationDateTime}
  ${getText('xxxPrincipals', locale, { token: amountOfPrincipalsSentFormatted })} ${getText('and', locale)}
  ${getText('xxxYields', locale, { token: amountOfYieldsSentFormatted })} ${getText('to', locale)}
  ${getText('xxxLpTokens', locale, { token: amountOfLPTokensReceivedFormatted })}

  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getLiquidityWithdrawalNotificationContent = ({
  chain,
  locale,
  receipt,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent) => {
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

  return `${notificationDateTime}
  ${getText('xxxLpTokens', locale, { token: amountOfLPTokensSentFormatted })} ${getText('to', locale)}
  ${getText('xxxPrincipals', locale, { token: amountOfPrincipalsReceivedFormatted })} ${getText('and', locale)}
  ${getText('xxxYields', locale, { token: amountOfYieldsReceivedFormatted })}

  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};

const getRedeemNotificationContent = ({
  chain,
  locale,
  receipt,
  userWallet,
  staticPoolData,
  notificationDateTime,
}: NotificationContent) => {
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

  return `${notificationDateTime}
  ${getText('xxxPrincipals', locale, { token: primitivesSentFormatted })} ${getText('to', locale)} ${getText(
    'yields',
    locale,
  )} ${getText('to', locale)}
  ${tokensReceivedFormatted} ${tokenReceivedTicker}
  
  ${generatePoolNotificationInfo(
    chain,
    locale,
    staticPoolData.backingToken,
    staticPoolData.protocol,
    new Date(staticPoolData.maturityDate),
  )}`;
};
