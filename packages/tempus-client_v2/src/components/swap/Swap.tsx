import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { refreshBalances } from '../../providers/balanceProviderHelper';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { PoolShares, Ticker } from '../../interfaces/Token';
import { Chain } from '../../interfaces/Chain';
import getText from '../../localisation/getText';
import { getChainConfig } from '../../utils/getConfig';
import { mul18f } from '../../utils/weiMath';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import { SwapKind } from '../../services/VaultService';
import NumberUtils from '../../services/NumberUtils';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import Descriptor from '../descriptor/Descriptor';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';

import './Swap.scss';

interface SwapProps {
  chain: Chain;
}

interface TokenDetail {
  tokenName: PoolShares;
  tokenAddress: string;
}

const Swap: FC<SwapProps> = props => {
  const { chain } = props;

  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();

  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);
  const { slippage, autoSlippage } = useContext(UserSettingsContext);
  const { language } = useContext(LanguageContext);

  const [tokenFrom, setTokenFrom] = useState<TokenDetail>({
    tokenName: 'Principals',
    tokenAddress: principalsAddress,
  });
  const [tokenTo, setTokenTo] = useState<TokenDetail>({
    tokenName: 'Yields',
    tokenAddress: yieldsAddress,
  });
  const [selectedToken, setSelectedToken] = useState<Ticker>(tokenFrom.tokenName);
  const [amount, setAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<BigNumber | null>(null);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);
  const [tokenPrecision, setTokenPrecision] = useState<number>(getTokenPrecision(selectedPoolAddress, 'principals'));

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }

    return selectedToken === 'Principals' ? userPrincipalsBalance : userYieldsBalance;
  }, [selectedToken, userPrincipalsBalance, userYieldsBalance]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === 'Principals' ? principalsAddress : yieldsAddress;
  }, [principalsAddress, selectedToken, yieldsAddress]);

  const onAmountChange = useCallback(
    (amount: string) => {
      if (amount) {
        setAmount(amount);
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  /**
   * Update amount field when user clicks on percentage buttons.
   * - Requires token balance to be loaded so we can calculate percentage of that.
   */
  const onMaxClick = useCallback(() => {
    const currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return;
    }
    setAmount(ethers.utils.formatUnits(currentBalance, tokenPrecision));
  }, [tokenPrecision, getSelectedTokenBalance]);

  const switchTokens = useCallback(() => {
    const tokenFromOld: TokenDetail = { ...tokenFrom };
    const tokenToOld: TokenDetail = { ...tokenTo };

    setTokenFrom(tokenToOld);
    setTokenTo(tokenFromOld);

    setSelectedToken(tokenToOld.tokenName);

    if (tokenToOld.tokenName === 'Principals') {
      setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'principals'));
    } else {
      setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'yields'));
    }
  }, [selectedPoolAddress, tokenFrom, tokenTo]);

  const onTokenFromChange = useCallback(
    (token: Ticker | undefined) => {
      if (token !== tokenFrom.tokenName) {
        switchTokens();
      }
    },
    [switchTokens, tokenFrom.tokenName],
  );

  const onTokenToChange = useCallback(
    (token: Ticker | undefined) => {
      if (token !== tokenTo.tokenName) {
        switchTokens();
      }
    },
    [switchTokens, tokenTo.tokenName],
  );

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner || !receiveAmount) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

    let tokenOutPrecision;
    if (tokenTo.tokenAddress === principalsAddress) {
      tokenOutPrecision = getTokenPrecision(selectedPoolAddress, 'principals');
    } else if (tokenTo.tokenAddress === yieldsAddress) {
      tokenOutPrecision = getTokenPrecision(selectedPoolAddress, 'yields');
    }

    if (!tokenOutPrecision) {
      return Promise.resolve(undefined);
    }

    const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();
    const minReturn = receiveAmount.sub(
      mul18f(receiveAmount, ethers.utils.parseUnits(actualSlippage, tokenOutPrecision), tokenOutPrecision),
    );

    const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);
    return poolDataAdapter.swapShareTokens(
      ammAddress,
      SwapKind.GIVEN_IN,
      tokenFrom.tokenAddress,
      tokenTo.tokenAddress,
      amountParsed,
      minReturn,
      userWalletAddress,
    );
  }, [
    ammAddress,
    amount,
    slippage,
    autoSlippage,
    selectedPoolAddress,
    principalsAddress,
    yieldsAddress,
    receiveAmount,
    tokenPrecision,
    tokenFrom.tokenAddress,
    tokenTo.tokenAddress,
    userWalletAddress,
    userWalletSigner,
    chain,
  ]);

  const onExecuted = useCallback(
    (successful: boolean, txBlockNumber?: number) => {
      setAmount('');

      if (!userWalletSigner) {
        return;
      }

      // Trigger user pool share balance update when execute is finished
      refreshBalances(
        {
          chain,
          userWalletAddress,
          userWalletSigner,
        },
        selectedPoolAddress,
        txBlockNumber,
      );
    },
    [selectedPoolAddress, userWalletAddress, userWalletSigner, chain],
  );

  // Fetch receive amount
  useEffect(() => {
    const getReceiveAmount = async () => {
      if (!userWalletSigner || !amount) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);
      const yieldShareIn = tokenFrom.tokenName === 'Yields';

      if (amountParsed.isZero()) {
        setReceiveAmount(BigNumber.from('0'));
        return;
      }

      try {
        setEstimateInProgress(true);
        const estimatedReceiveAmount = await poolDataAdapter.getExpectedReturnForShareToken(
          ammAddress,
          amountParsed,
          yieldShareIn,
        );
        setReceiveAmount(estimatedReceiveAmount);
        setEstimateInProgress(false);
      } catch (error) {
        console.error('DetailSwap - getReceiveAmount() - Failed to fetch expected amount of returned tokens!', error);
        setEstimateInProgress(false);
      }
    };
    getReceiveAmount();
  }, [tokenPrecision, amount, tokenFrom, userWalletSigner, ammAddress, chain]);

  const balanceFormatted = useMemo(() => {
    const currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(currentBalance, tokenPrecision), decimalsForUI);
  }, [getSelectedTokenBalance, tokenPrecision, decimalsForUI]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(receiveAmount, tokenPrecision), decimalsForUI);
  }, [receiveAmount, tokenPrecision, decimalsForUI]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, tokenPrecision, getSelectedTokenBalance, tokensApproved, estimateInProgress]);

  return (
    <div className="tc__swap">
      <Descriptor>{getText('swapDescription', language)}</Descriptor>
      <SectionContainer
        title={
          selectedToken && balanceFormatted ? (
            <div className="tc__title-and-balance">
              <Typography variant="card-title">{getText('from', language)}</Typography>
              <Typography variant="body-text">
                {getText('balance', language)} {balanceFormatted}
              </Typography>
            </div>
          ) : (
            'from'
          )
        }
      >
        <div className="tf__flex-row-center-v">
          <TokenSelector
            value={tokenFrom.tokenName}
            tickers={['Principals', 'Yields']}
            onTokenChange={onTokenFromChange}
          />
          <Spacer size={15} />
          <CurrencyInput
            defaultValue={amount}
            precision={tokenPrecision}
            onChange={onAmountChange}
            disabled={!selectedToken}
            onMaxClick={onMaxClick}
            disabledTooltip={getText('selectTokenFirst', language)}
          />
          <Spacer size={15} />
        </div>
        <Spacer size={20} />
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to" elevation={1}>
        <div className="tf__flex-row-center-v">
          <TokenSelector value={tokenTo.tokenName} tickers={['Principals', 'Yields']} onTokenChange={onTokenToChange} />
          <Spacer size={15} />
          <Typography variant="card-body-text">{getText('estimatedAmountReceived', language)}</Typography>
          <Spacer size={15} />
          <Typography variant="card-body-text">{receiveAmountFormatted}</Typography>
        </div>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Approve
            amountToApprove={getSelectedTokenBalance()}
            onApproveChange={onApproveChange}
            spenderAddress={getChainConfig(chain).vaultContract}
            tokenToApproveTicker={tokenFrom.tokenName}
            tokenToApproveAddress={getSelectedTokenAddress()}
            marginRight={20}
            chain={chain}
          />
          <Execute
            actionName="Swap"
            disabled={executeDisabled}
            chain={chain}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default Swap;
