import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { Tooltip } from '@material-ui/core';
import getSidebarDataAdapter from '../../adapters/getSidebarDataAdapter';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Words from '../../localisation/words';
import { TransactionView } from '../../interfaces/TransactionView';
import { Chain } from '../../interfaces/Chain';
import { getChainConfig } from '../../utils/getConfig';
import shortenAccount from '../../utils/shortenAccount';
import TokenIcon from '../tokenIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';

import './Sidebar.scss';

const basicViews: TransactionView[] = ['deposit', 'withdraw'];
const advancedViews: TransactionView[] = ['mint', 'swap', 'provideLiquidity', 'removeLiquidity', 'earlyRedeem'];

type SidebarOutProps = {
  onSelectedView: (selectedView: TransactionView) => void;
};

type SidebarInProps = {
  initialView: TransactionView;
  chain: Chain;
};

type SidebarProps = SidebarInProps & SidebarOutProps;

const Sidebar: FC<SidebarProps> = ({ initialView, chain, onSelectedView }) => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { language } = useContext(LanguageContext);

  const [selectedView, setSelectedView] = useState<TransactionView | null>(null);

  const [depositDisabledReason, setDepositDisabledReason] = useState<Words | null>(null);
  const [withdrawDisabledReason, setWithdrawDisabledReason] = useState<Words | null>(null);

  const [mintDisabledReason, setMintDisabledReason] = useState<Words | null>(null);
  const [swapDisabledReason, setSwapDisabledReason] = useState<Words | null>(null);
  const [provideLiquidityDisabledReason, setProvideLiquidityDisabledReason] = useState<Words | null>(null);
  const [removeLiquidityDisabledReason, setRemoveLiquidityDisabledReason] = useState<Words | null>(null);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const protocolDisplayName = staticPoolData[selectedPool.get()].protocolDisplayName.attach(Downgraded).get();
  const poolShareBalance = dynamicPoolData[selectedPoolAddress].poolShareBalance.attach(Downgraded).get();
  const negativeYield = dynamicPoolData[selectedPoolAddress].negativeYield.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPoolAddress].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPoolAddress].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPoolAddress].userLPTokenBalance.attach(Downgraded).get();

  const onItemClick = useCallback(
    (itemName: TransactionView) => {
      setSelectedView(itemName as TransactionView);
      onSelectedView(itemName as TransactionView);
    },
    [onSelectedView],
  );

  useEffect(() => {
    if (initialView && initialView !== selectedView) {
      setSelectedView(initialView);
    }
  }, [initialView, selectedView]);

  const onPoolAddressClick = useCallback(() => {
    const config = getChainConfig(chain);

    if (config.networkName === 'homestead') {
      window.open(`https://etherscan.io/address/${selectedPoolAddress}`, '_blank');
    } else if (config.networkName === 'fantom-mainnet') {
      window.open(`https://ftmscan.com/address/${selectedPoolAddress}`, '_blank');
    } else {
      window.open(`https://${config.networkName}.etherscan.io/address/${selectedPoolAddress}`, '_blank');
    }
  }, [selectedPoolAddress, chain]);

  useEffect(() => {
    setDepositDisabledReason(
      getSidebarDataAdapter().getDepositDisabledReason(selectedPoolAddress, poolShareBalance, negativeYield),
    );
  }, [selectedPoolAddress, poolShareBalance, negativeYield]);

  useEffect(() => {
    setWithdrawDisabledReason(
      getSidebarDataAdapter().getWithdrawDisabledReason(
        poolShareBalance,
        negativeYield,
        userPrincipalsBalance,
        userYieldsBalance,
        userLPTokenBalance,
      ),
    );
  }, [poolShareBalance, negativeYield, userPrincipalsBalance, userYieldsBalance, userLPTokenBalance]);

  useEffect(() => {
    setMintDisabledReason(getSidebarDataAdapter().getMintDisabledReason(selectedPoolAddress));
  }, [selectedPoolAddress]);

  useEffect(() => {
    setSwapDisabledReason(
      getSidebarDataAdapter().getSwapDisabledReason(
        selectedPoolAddress,
        poolShareBalance,
        userPrincipalsBalance,
        userYieldsBalance,
      ),
    );
  }, [selectedPoolAddress, poolShareBalance, userPrincipalsBalance, userYieldsBalance]);

  useEffect(() => {
    setProvideLiquidityDisabledReason(
      getSidebarDataAdapter().getProvideLiquidityDisabledReason(
        selectedPoolAddress,
        userPrincipalsBalance,
        userYieldsBalance,
      ),
    );
  }, [selectedPoolAddress, userPrincipalsBalance, userYieldsBalance]);

  useEffect(() => {
    setRemoveLiquidityDisabledReason(
      getSidebarDataAdapter().getRemoveLiquidityDisabledReason(
        selectedPoolAddress,
        userPrincipalsBalance,
        userYieldsBalance,
        userLPTokenBalance,
      ),
    );
  }, [selectedPoolAddress, userPrincipalsBalance, userYieldsBalance, userLPTokenBalance]);

  // Temporarily disabled
  // const earlyRedeemHidden = useMemo(() => {
  //   if (1 + 1 === 2 || !userPrincipalsBalance || !userYieldsBalance) {
  //     return true;
  //   }
  //   return userPrincipalsBalance.isZero() && userYieldsBalance.isZero();
  // }, [userPrincipalsBalance, userYieldsBalance]);

  return (
    <div className="tc__sidebar-container">
      <TokenIcon ticker={backingToken} large />
      <Spacer size={5} />
      <Typography variant="h4">{protocolDisplayName}</Typography>
      <Spacer size={5} />
      <Typography variant="h4">{backingToken} Pool</Typography>
      <Spacer size={10} />
      <div onClick={onPoolAddressClick} className="tc__sidebar-pool-link">
        <Typography variant="body-text" color="link">
          {shortenAccount(selectedPoolAddress)}
        </Typography>
      </div>

      <div className="tc__sidebar-list-items-wrapper">
        {/* Basic Section */}
        <div className="tc__sidebar-section-title">
          <Typography variant="h5" color="title">
            {getText('basic', language)}
          </Typography>
          <Typography variant="sub-title" color="title">
            {getText('basicSubTitle', language)}
          </Typography>
        </div>
        {basicViews.map((basicViewName: TransactionView) => {
          let disabledReason: Words | null = null;

          if (basicViewName === 'deposit' && depositDisabledReason) {
            disabledReason = depositDisabledReason;
          } else if (basicViewName === 'withdraw' && withdrawDisabledReason) {
            disabledReason = withdrawDisabledReason;
          }

          const selected = selectedView === basicViewName;
          return (
            <div key={basicViewName}>
              {disabledReason && (
                <Tooltip title={disabledReason ? getText(disabledReason, language) : ''}>
                  <div className="tc__sidebar-view-item disabled">
                    <Typography variant="h5" color="title">
                      {getText(basicViewName, language)}
                    </Typography>
                  </div>
                </Tooltip>
              )}

              {!disabledReason && (
                <div
                  className={`tc__sidebar-view-item ${selected ? 'selected' : ''}`}
                  onClick={() => onItemClick(basicViewName)}
                >
                  <Typography variant="h5" color={selected ? 'inverted' : 'default'}>
                    {getText(basicViewName, language)}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
        {/* Advanced Section */}
        <div className="tc__sidebar-section-title">
          <Typography variant="h5" color="title">
            {getText('advanced', language)}
          </Typography>
          <Typography variant="sub-title" color="title">
            {getText('advancedSubTitle', language)}
          </Typography>
        </div>
        {advancedViews.map(advancedViewName => {
          let disabledReason: Words | null = null;

          if (advancedViewName === 'mint' && mintDisabledReason) {
            disabledReason = mintDisabledReason;
          } else if (advancedViewName === 'swap' && swapDisabledReason) {
            disabledReason = swapDisabledReason;
          } else if (advancedViewName === 'provideLiquidity' && provideLiquidityDisabledReason) {
            disabledReason = provideLiquidityDisabledReason;
          } else if (advancedViewName === 'removeLiquidity' && removeLiquidityDisabledReason) {
            disabledReason = removeLiquidityDisabledReason;
          } else if (advancedViewName === 'earlyRedeem') {
            return null;
          }

          const selected = selectedView === advancedViewName;
          return (
            <div key={advancedViewName}>
              {disabledReason && (
                <Tooltip title={disabledReason ? getText(disabledReason, language) : ''}>
                  <div className="tc__sidebar-view-item disabled">
                    <Typography variant="h5" color="title">
                      {getText(advancedViewName, language)}
                    </Typography>
                  </div>
                </Tooltip>
              )}
              {!disabledReason && (
                <div
                  className={`tc__sidebar-view-item ${selected ? 'selected' : ''}`}
                  onClick={() => onItemClick(advancedViewName)}
                >
                  <Typography variant="h5" color={selected ? 'inverted' : 'default'}>
                    {getText(advancedViewName, language)}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Sidebar;
