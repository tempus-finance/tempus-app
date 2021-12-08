import { Downgraded, useState as useHookState } from '@hookstate/core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import NumberUtils from '../../services/NumberUtils';
import { isZeroString } from '../../utils/isZeroString';
import getConfig from '../../utils/getConfig';
import Approve from '../buttons/Approve';

import './RemoveLiquidity.scss';

const RemoveLiquidity = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { language } = useContext(LanguageContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

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
        const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

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
  }, [amount, ammAddress, userWalletSigner]);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    return poolDataAdapter.removeLiquidity(
      ammAddress,
      userWalletAddress,
      principalsAddress,
      yieldsAddress,
      ethers.utils.parseEther(amount),
    );
  }, [userWalletSigner, ammAddress, userWalletAddress, principalsAddress, yieldsAddress, amount]);

  const onExecuted = useCallback(() => {
    setAmount('');
    setEstimatedPrincipals(null);
    setEstimatedYields(null);

    // Trigger user pool share balance update when execute is finished
    getUserShareTokenBalanceProvider({
      userWalletAddress,
    }).fetchForPool(selectedPoolAddress);
  }, [selectedPoolAddress, userWalletAddress]);

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
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedPrincipals), decimalsForUI);
  }, [estimatedPrincipals, decimalsForUI]);

  const estimatedYieldsFormatted = useMemo(() => {
    if (!estimatedYields) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedYields), decimalsForUI);
  }, [estimatedYields, decimalsForUI]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount;
  }, [amount]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils.parseEther(amount || '0').gt(userLPTokenBalance || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, userLPTokenBalance, tokensApproved, estimateInProgress]);

  return (
    <div className="tc__removeLiquidity">
      <SectionContainer title="from">
        <SectionContainer elevation={2}>
          <Typography variant="h4">{getText('lpTokens', language)}</Typography>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput defaultValue={amount} onChange={onAmountChange} onMaxClick={onPercentageChange} />
              <Spacer size={15} />
              <Typography variant="card-body-text">{getText('balance', language)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">{lpTokenBalanceFormatted}</Typography>
            </div>
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="LP Token"
                amountToApprove={userLPTokenBalance}
                onApproveChange={onApproveChange}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={ammAddress}
                disabled={approveDisabled}
              />
            </div>
          </div>
        </SectionContainer>
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className="tf__flex-row-center-v">
          <SectionContainer>
            <Typography variant="h4">{getText('principals', language)}</Typography>
            <Spacer size={10} />
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimated', language)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">{estimatedPrincipalsFormatted}</Typography>
            </div>
          </SectionContainer>
          <PlusIconContainer orientation="vertical" />
          <SectionContainer>
            <Typography variant="h4">{getText('yields', language)}</Typography>
            <Spacer size={10} />
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimated', language)}</Typography>
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
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default RemoveLiquidity;
