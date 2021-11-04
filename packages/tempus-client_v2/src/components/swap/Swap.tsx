import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { PoolShares, Ticker } from '../../interfaces/Token';
import getConfig from '../../utils/getConfig';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import { SwapKind } from '../../services/VaultService';
import NumberUtils from '../../services/NumberUtils';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';

import './Swap.scss';

interface TokenDetail {
  tokenName: PoolShares;
  tokenAddress: string;
}

const Swap = () => {
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const [tokenFrom, setTokenFrom] = useState<TokenDetail>({
    tokenName: 'Principals',
    tokenAddress: activePoolData.principalsAddress,
  });
  const [tokenTo, setTokenTo] = useState<TokenDetail>({
    tokenName: 'Yields',
    tokenAddress: activePoolData.yieldsAddress,
  });
  const [selectedToken, setSelectedToken] = useState<Ticker>(tokenFrom.tokenName);
  const [amount, setAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<BigNumber | null>(null);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);
  const [tokenPrecision, setTokenPrecision] = useState<number>(getTokenPrecision(activePoolData.address, 'principals'));

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === 'Principals' ? activePoolData.userPrincipalsBalance : activePoolData.userYieldsBalance;
  }, [selectedToken, activePoolData]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === 'Principals' ? activePoolData.principalsAddress : activePoolData.yieldsAddress;
  }, [activePoolData, selectedToken]);

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
      setTokenPrecision(getTokenPrecision(activePoolData.address, 'principals'));
    } else {
      setTokenPrecision(getTokenPrecision(activePoolData.address, 'yields'));
    }
  }, [activePoolData.address, tokenFrom, tokenTo]);

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
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);
    return poolDataAdapter.swapShareTokens(
      activePoolData.ammAddress,
      SwapKind.GIVEN_IN,
      tokenFrom.tokenAddress,
      tokenTo.tokenAddress,
      amountParsed,
      userWalletAddress,
    );
  }, [
    userWalletSigner,
    amount,
    tokenPrecision,
    activePoolData.ammAddress,
    tokenFrom.tokenAddress,
    tokenTo.tokenAddress,
    userWalletAddress,
  ]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  // Fetch receive amount
  useEffect(() => {
    const getReceiveAmount = async () => {
      if (!userWalletSigner || !amount) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);
      const yieldShareIn = tokenFrom.tokenName === 'Yields';

      if (amountParsed.isZero()) {
        setReceiveAmount(BigNumber.from('0'));
        return;
      }

      try {
        setEstimateInProgress(true);
        const estimatedReceiveAmount = await poolDataAdapter.getExpectedReturnForShareToken(
          activePoolData.ammAddress,
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
  }, [tokenPrecision, amount, tokenFrom, setReceiveAmount, userWalletSigner, activePoolData]);

  const balanceFormatted = useMemo(() => {
    const currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(currentBalance, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [tokenPrecision, getSelectedTokenBalance, activePoolData]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(receiveAmount, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [receiveAmount, tokenPrecision, activePoolData]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount;
  }, [amount]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, tokenPrecision, getSelectedTokenBalance, tokensApproved, estimateInProgress]);

  return (
    <div className="tc__swap">
      <SectionContainer title="from" elevation={1}>
        <div className="tf__flex-row-center-v">
          <TokenSelector
            defaultTicker={tokenFrom.tokenName}
            tickers={['Principals', 'Yields']}
            onTokenChange={onTokenFromChange}
          />
          <Spacer size={15} />
          <CurrencyInput
            defaultValue={amount}
            onChange={onAmountChange}
            disabled={!selectedToken}
            onMaxClick={onMaxClick}
          />
          <Spacer size={15} />
          <Typography variant="card-body-text">Balance</Typography>
          <Spacer size={15} />
          {selectedToken && balanceFormatted && <Typography variant="card-body-text">{balanceFormatted}</Typography>}
        </div>
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to" elevation={1}>
        <div className="tf__flex-row-center-v">
          <TokenSelector
            defaultTicker={tokenTo.tokenName}
            tickers={['Principals', 'Yields']}
            onTokenChange={onTokenToChange}
          />
          <Spacer size={15} />
          <Typography variant="card-body-text">Estimated amount received</Typography>
          <Spacer size={15} />
          <Typography variant="card-body-text">{receiveAmountFormatted}</Typography>
        </div>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Approve
            amountToApprove={getSelectedTokenBalance()}
            onApproveChange={onApproveChange}
            spenderAddress={getConfig().vaultContract}
            tokenToApproveTicker={tokenFrom.tokenName}
            tokenToApproveAddress={getSelectedTokenAddress()}
            marginRight={20}
            disabled={approveDisabled}
          />
          <Execute
            actionName="Swap"
            tempusPool={activePoolData}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default Swap;
