import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { getTokenPrecision, isZeroString, mul18f, NumberUtils } from 'tempus-core-services';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { refreshBalances } from '../../providers/balanceProviderHelper';
import { LocaleContext } from '../../context/localeContext';
import { WalletContext } from '../../context/walletContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { Chain } from '../../interfaces/Chain';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import Descriptor from '../descriptor/Descriptor';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { getChainConfig, getConfig } from '../../utils/getConfig';
import Approve from '../buttons/Approve';

import './RemoveLiquidity.scss';

interface RemoveLiquidityProps {
  chain: Chain;
}

const RemoveLiquidity: FC<RemoveLiquidityProps> = props => {
  const { chain } = props;

  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { locale } = useContext(LocaleContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);
  const { slippage, autoSlippage } = useContext(UserSettingsContext);

  const [amount, setAmount] = useState<string>('');
  const [estimatedPrincipals, setEstimatedPrincipals] = useState<BigNumber | null>(null);
  const [estimatedYields, setEstimatedYields] = useState<BigNumber | null>(null);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();

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
   * - Requires user LP token balance to be loaded so we can calculate percentage of that.
   */
  const onPercentageChange = useCallback(() => {
    if (userLPTokenBalance) {
      setAmount(ethers.utils.formatEther(userLPTokenBalance));
    }
  }, [userLPTokenBalance]);

  // Fetch estimated share tokens returned
  useEffect(() => {
    const getTokensEstimate = async () => {
      if (!userWalletSigner || !amount) {
        return;
      }

      try {
        const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

        setEstimateInProgress(true);
        const estimate = await poolDataAdapter.getExpectedReturnForLPTokens(
          ammAddress,
          ethers.utils.parseEther(amount),
        );
        setEstimatedPrincipals(estimate.principals);
        setEstimatedYields(estimate.yields);
        setEstimateInProgress(false);
      } catch (error) {
        console.error('DetailPoolRemoveLiquidity - getTokensEstimate() - Failed to fetch estimated return!', error);
        setEstimateInProgress(false);
      }
    };
    getTokensEstimate();
  }, [amount, ammAddress, userWalletSigner, chain]);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner || !estimatedPrincipals || !estimatedYields) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
    const config = getConfig();

    const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();
    const minPrincipalsReceived = estimatedPrincipals.sub(
      mul18f(
        estimatedPrincipals,
        ethers.utils.parseUnits(actualSlippage, getTokenPrecision(selectedPoolAddress, 'principals', config)),
        getTokenPrecision(selectedPoolAddress, 'principals', config),
      ),
    );
    const minYieldsReceived = estimatedYields.sub(
      mul18f(
        estimatedYields,
        ethers.utils.parseUnits(actualSlippage, getTokenPrecision(selectedPoolAddress, 'yields', config)),
        getTokenPrecision(selectedPoolAddress, 'yields', config),
      ),
    );

    return poolDataAdapter.removeLiquidity(
      ammAddress,
      userWalletAddress,
      principalsAddress,
      yieldsAddress,
      ethers.utils.parseEther(amount),
      minPrincipalsReceived,
      minYieldsReceived,
    );
  }, [
    userWalletSigner,
    estimatedPrincipals,
    estimatedYields,
    autoSlippage,
    slippage,
    selectedPoolAddress,
    ammAddress,
    userWalletAddress,
    principalsAddress,
    yieldsAddress,
    amount,
    chain,
  ]);

  const lpTokensAmountToApprove = useMemo(() => {
    if (!amount) {
      return null;
    }

    return ethers.utils.parseUnits(amount, getTokenPrecision(selectedPoolAddress, 'lpTokens', getConfig()));
  }, [selectedPoolAddress, amount]);

  const onExecuted = useCallback(
    (successful: boolean, txBlockNumber?: number) => {
      setAmount('');
      setEstimatedPrincipals(null);
      setEstimatedYields(null);

      if (!userWalletSigner) {
        return;
      }

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

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userLPTokenBalance), decimalsForUI);
  }, [decimalsForUI, userLPTokenBalance]);

  const estimatedPrincipalsFormatted = useMemo(() => {
    if (!estimatedPrincipals) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedPrincipals, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [estimatedPrincipals, decimalsForUI, tokenPrecision.principals]);

  const estimatedYieldsFormatted = useMemo(() => {
    if (!estimatedYields) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedYields, tokenPrecision.yields),
      decimalsForUI,
    );
  }, [estimatedYields, decimalsForUI, tokenPrecision.yields]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision.lpTokens)
      .gt(userLPTokenBalance || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, userLPTokenBalance, tokensApproved, estimateInProgress, tokenPrecision.lpTokens]);

  return (
    <div className="tc__removeLiquidity">
      <Descriptor>{getText('removeLiquidityDescription', locale)}</Descriptor>
      <SectionContainer title="from">
        <SectionContainer elevation={2}>
          <div className="tc__title-and-balance">
            <Typography variant="h4">{getText('lpTokens', locale)}</Typography>
            {lpTokenBalanceFormatted && (
              <div>
                <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                <Spacer size={15} />
                <Typography variant="card-body-text">{lpTokenBalanceFormatted}</Typography>
              </div>
            )}
          </div>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput
                defaultValue={amount}
                precision={tokenPrecision.lpTokens}
                onChange={onAmountChange}
                onMaxClick={onPercentageChange}
              />
              <Spacer size={15} />
            </div>
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="LP Token"
                amountToApprove={lpTokensAmountToApprove}
                userBalance={userLPTokenBalance}
                onApproveChange={onApproveChange}
                spenderAddress={getChainConfig(chain).vaultContract}
                tokenToApproveAddress={ammAddress}
                chain={chain}
              />
            </div>
          </div>
        </SectionContainer>
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className="tf__flex-row-center-v">
          <SectionContainer>
            <Typography variant="h4">{getText('principals', locale)}</Typography>
            <Spacer size={10} />
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimated', locale)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">{estimatedPrincipalsFormatted}</Typography>
            </div>
          </SectionContainer>
          <PlusIconContainer orientation="vertical" />
          <SectionContainer>
            <Typography variant="h4">{getText('yields', locale)}</Typography>
            <Spacer size={10} />
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimated', locale)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">{estimatedYieldsFormatted}</Typography>
            </div>
          </SectionContainer>
        </div>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Execute
            actionName="Liquidity Withdrawal"
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
export default RemoveLiquidity;
