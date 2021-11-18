import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
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
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const [amount, setAmount] = useState<string>('');
  const [estimatedPrincipals, setEstimatedPrincipals] = useState<BigNumber | null>(null);
  const [estimatedYields, setEstimatedYields] = useState<BigNumber | null>(null);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

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
    if (activePoolData.userLPTokenBalance) {
      setAmount(ethers.utils.formatEther(activePoolData.userLPTokenBalance));
    }
  }, [activePoolData.userLPTokenBalance]);

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
          activePoolData.ammAddress,
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
  }, [amount, activePoolData.ammAddress, userWalletSigner]);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    return poolDataAdapter.removeLiquidity(
      activePoolData.ammAddress,
      userWalletAddress,
      activePoolData.principalsAddress,
      activePoolData.yieldsAddress,
      ethers.utils.parseEther(amount),
    );
  }, [amount, activePoolData, userWalletAddress, userWalletSigner]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!activePoolData.userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(activePoolData.userLPTokenBalance),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData]);

  const estimatedPrincipalsFormatted = useMemo(() => {
    if (!estimatedPrincipals) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedPrincipals), activePoolData.decimalsForUI);
  }, [estimatedPrincipals, activePoolData.decimalsForUI]);

  const estimatedYieldsFormatted = useMemo(() => {
    if (!estimatedYields) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedYields), activePoolData.decimalsForUI);
  }, [estimatedYields, activePoolData.decimalsForUI]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount;
  }, [amount]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseEther(amount || '0')
      .gt(activePoolData.userLPTokenBalance || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, activePoolData.userLPTokenBalance, tokensApproved, estimateInProgress]);

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
                amountToApprove={activePoolData.userLPTokenBalance}
                onApproveChange={onApproveChange}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={activePoolData.ammAddress}
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
export default RemoveLiquidity;
