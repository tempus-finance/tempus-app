import { ethers, BigNumber } from 'ethers';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { Ticker } from '../../interfaces/Token';
import NumberUtils from '../../services/NumberUtils';
import getConfig from '../../utils/getConfig';
import getTokenPrecision from '../../utils/getTokenPrecision';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';

import './Withdraw.scss';

const Withdraw = () => {
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { userWalletSigner } = useContext(WalletContext);

  const selectedPoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const supportedTokens = [selectedPoolData.backingToken, selectedPoolData.yieldBearingToken].filter(
    token => token !== 'ETH',
  );

  const [selectedToken, setSelectedToken] = useState<Ticker>(selectedPoolData.yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const [tokenPrecision, setTokenPrecision] = useState<number | undefined>();

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (token) {
        if (selectedPoolData.backingToken === token) {
          setTokenPrecision(getTokenPrecision(selectedPoolData.address, 'backingToken'));
        } else {
          setTokenPrecision(getTokenPrecision(selectedPoolData.address, 'yieldBearingToken'));
        }

        setSelectedToken(token);
      }
    },
    [selectedPoolData],
  );

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    const { ammAddress, userPrincipalsBalance, userLPTokenBalance, backingToken } = selectedPoolData;

    if (userWalletSigner && userPrincipalsBalance && userLPTokenBalance) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const isBackingToken = backingToken === selectedToken;

      return poolDataAdapter.executeWithdraw(ammAddress, userPrincipalsBalance, userLPTokenBalance, isBackingToken);
    } else {
      return Promise.resolve(undefined);
    }
  }, [userWalletSigner, selectedPoolData, selectedToken]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const { address, ammAddress, userPrincipalsBalance, userYieldsBalance, userLPTokenBalance, backingToken } =
      selectedPoolData;

    if (userWalletSigner && userPrincipalsBalance && userYieldsBalance && userLPTokenBalance) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      try {
        const isBackingToken = backingToken === selectedToken;
        const stream$ = poolDataAdapter
          .getEstimatedWithdrawAmount(
            ammAddress,
            userLPTokenBalance,
            userPrincipalsBalance,
            userYieldsBalance,
            isBackingToken,
          )
          .subscribe(amount => {
            setEstimatedWithdrawAmount(amount);

            if (backingToken === selectedToken) {
              setTokenPrecision(getTokenPrecision(address, 'backingToken'));
            } else {
              setTokenPrecision(getTokenPrecision(address, 'yieldBearingToken'));
            }
          });

        return () => stream$.unsubscribe();
      } catch (error) {
        console.log('DetailWithdraw - retrieveWithdrawAmount() - Failed to fetch estimated withdraw amount!', error);
      }
    }
  }, [selectedToken, selectedPoolData, userWalletSigner]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!selectedPoolData.userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        selectedPoolData.userPrincipalsBalance,
        getTokenPrecision(selectedPoolData.address, 'principals'),
      ),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!selectedPoolData.userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        selectedPoolData.userYieldsBalance,
        getTokenPrecision(selectedPoolData.address, 'yields'),
      ),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData]);

  const lpBalanceFormatted = useMemo(() => {
    if (!selectedPoolData.userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        selectedPoolData.userLPTokenBalance,
        getTokenPrecision(selectedPoolData.address, 'lpTokens'),
      ),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision),
      selectedPoolData.decimalsForUI,
    );
  }, [estimatedWithdrawAmount, tokenPrecision, selectedPoolData.decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    const data = getDataForPool(selectedPoolData.address, poolData);

    if (!data.userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(data.userBalanceUSD, tokenPrecision), 2, '$');
  }, [selectedPoolData.address, poolData, tokenPrecision]);

  const executeDisabled = useMemo(() => {
    const { userPrincipalsBalance, userYieldsBalance, userLPTokenBalance } = selectedPoolData;

    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();
    const lpBalanceZero = userLPTokenBalance && userLPTokenBalance.isZero();

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      (!lpBalanceZero && !lpApproved)
    );
  }, [principalsApproved, yieldsApproved, lpApproved, selectedPoolData]);

  return (
    <div className="tc__withdraw">
      <SectionContainer title="From" elevation={1}>
        {selectedPoolData.userPrincipalsBalance && !selectedPoolData.userPrincipalsBalance.isZero() && (
          <SectionContainer elevation={2}>
            <div className="tf__flex-row-space-between">
              <div className="tf__flex-column-space-between">
                <Typography variant="h4">Principals</Typography>
                <Spacer size={10} />
                <Typography variant="card-body-text">Balance {principalsBalanceFormatted} Principals</Typography>
              </div>
              <div className="tf__flex-column-center-end">
                <Approve
                  tokenToApproveAddress={selectedPoolData.principalsAddress}
                  tokenToApproveTicker="Principals"
                  amountToApprove={selectedPoolData.userPrincipalsBalance}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproveChange={approved => {
                    setPrincipalsApproved(approved);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
        )}
        {selectedPoolData.userYieldsBalance && !selectedPoolData.userYieldsBalance.isZero() && (
          <>
            <PlusIconContainer orientation="horizontal" />
            <SectionContainer elevation={2}>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">Yields</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">Balance {yieldsBalanceFormatted} Yields</Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <Approve
                    tokenToApproveAddress={selectedPoolData.yieldsAddress}
                    tokenToApproveTicker="Yields"
                    amountToApprove={selectedPoolData.userYieldsBalance}
                    spenderAddress={getConfig().tempusControllerContract}
                    onApproveChange={approved => {
                      setYieldsApproved(approved);
                    }}
                  />
                </div>
              </div>
            </SectionContainer>
          </>
        )}
        {selectedPoolData.userLPTokenBalance && !selectedPoolData.userLPTokenBalance.isZero() && (
          <>
            <PlusIconContainer orientation="horizontal" />
            <SectionContainer elevation={2}>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">LP Tokens</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">Balance {lpBalanceFormatted} LP Tokens</Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <Approve
                    tokenToApproveAddress={selectedPoolData.ammAddress}
                    tokenToApproveTicker="LP Token"
                    spenderAddress={getConfig().tempusControllerContract}
                    amountToApprove={selectedPoolData.userLPTokenBalance}
                    // TempusAMM address is used as LP token address
                    onApproveChange={approved => {
                      setLpApproved(approved);
                    }}
                  />
                </div>
              </div>
            </SectionContainer>
          </>
        )}
      </SectionContainer>
      <Spacer size={20} />
      <SectionContainer title="To">
        <SectionContainer elevation={2}>
          <div className="tf__flex-row-center-v">
            <TokenSelector
              tickers={supportedTokens}
              defaultTicker={selectedToken as Ticker}
              onTokenChange={onTokenChange}
            />
            <Spacer size={15} />
            <Typography variant="card-body-text">Estimated amount received</Typography>
            <Spacer size={15} />
            <Typography variant="card-body-text">
              {estimatedWithdrawAmountFormatted} {selectedToken}
            </Typography>
            <Spacer size={15} />
            <Typography variant="card-body-text">({estimatedWithdrawAmountUsdFormatted})</Typography>
          </div>
        </SectionContainer>
      </SectionContainer>
      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <Execute
          actionName="Withdraw"
          tempusPool={selectedPoolData}
          disabled={executeDisabled}
          onExecute={onExecute}
          onExecuted={() => {}}
        />
      </div>
    </div>
  );
};
export default Withdraw;
