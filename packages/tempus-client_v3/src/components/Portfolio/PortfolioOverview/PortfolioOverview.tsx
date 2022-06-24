import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal, DecimalUtils, ZERO } from 'tempus-core-services';
import { usePoolBalances, useSelectedChain, useUserDepositedPools, useWalletAddress } from '../../../hooks';
import { Tab, Tabs, Typography } from '../../shared';
import PortfolioValueChart from './PortfolioValueChart';
import PortfolioYieldChart from './PortfolioYieldChart';
import PortfolioInfoBox from './PortfolioInfoBox';
import PortfolioOverviewNoPositions from './PortfolioOverviewNoPositions';
import PortfolioOverviewWalletNotConnected from './PortfolioOverviewWalletNotConnected';

import './PortfolioOverview.scss';

const PortfolioOverview: FC = () => {
  const { t } = useTranslation();

  const userDepositedPools = useUserDepositedPools();
  const [selectedChain] = useSelectedChain();
  const balances = usePoolBalances();
  const [walletAddress] = useWalletAddress();

  const [view, setView] = useState('yield');

  const usdBalance = useMemo(
    () =>
      Object.entries(balances)
        // Only purpose of filtering with `selectedChain` is to trigger balance update after chain change
        .filter(([chainPoolAddress]) => chainPoolAddress.match(new RegExp(`${selectedChain}-.+`)))
        .map(([, balance]) => balance)
        .reduce(
          (sum, balance) => (balance.balanceInUsd ? balance.balanceInUsd.add(sum ?? ZERO) : sum),
          null as Decimal | null,
        ),
    [balances, selectedChain],
  );

  // TODO: Fetch real values
  const earnedYield = '30.24';
  const projectedYield = '42.78';

  return (
    <div className="tc__app__portfolio-overview">
      {walletAddress && (
        <>
          <div className="tc__app__portfolio-info-container">
            <PortfolioInfoBox
              title={t('PortfolioOverview.titleCurrentValue')}
              subtitle={t('PortfolioOverview.subtitleCurrentValue')}
              value={usdBalance ? DecimalUtils.formatToCurrency(usdBalance, 2) : ''}
            />
            <PortfolioInfoBox
              title={t('PortfolioOverview.titleEarnedYield')}
              subtitle={t('PortfolioOverview.subtitleEarnedYield')}
              value={earnedYield}
            />
            <PortfolioInfoBox
              title={t('PortfolioOverview.titleProjectedYield')}
              subtitle={t('PortfolioOverview.subtitleProjectedYield')}
              value={projectedYield}
            />
          </div>
          <div className="tc__app__portfolio-box tc__app__portfolio-main-content">
            <div className="tc__app__portfolio-header">
              <Typography variant="title" weight="bold">
                {view === 'yield' && t('PortfolioOverview.titleTotalYieldEarned')}
                {view === 'value' && t('PortfolioOverview.titleTotalPortfolioValue')}
              </Typography>
              <Tabs size="small" value={view} onTabSelected={setView}>
                <Tab value="yield" label={t('PortfolioOverview.tabYield')} />
                <Tab value="value" label={t('PortfolioOverview.tabValue')} />
              </Tabs>
            </div>
            {view === 'yield' && <PortfolioYieldChart />}
            {view === 'value' && <PortfolioValueChart />}
            {walletAddress && !userDepositedPools.length && <PortfolioOverviewNoPositions />}
          </div>
        </>
      )}
      {!walletAddress && <PortfolioOverviewWalletNotConnected />}
    </div>
  );
};

export default PortfolioOverview;
