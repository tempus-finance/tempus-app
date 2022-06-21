import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DecimalUtils } from 'tempus-core-services';
import { useUserDepositedPools, useUserUsdBalance } from '../../../hooks';
import { Tab, Tabs, Typography } from '../../shared';
import PortfolioValueChart from './PortfolioValueChart';
import PortfolioYieldChart from './PortfolioYieldChart';
import PortfolioInfoBox from './PortfolioInfoBox';
import PortfolioOverviewNoPositions from './PortfolioOverviewNoPositions';

const PortfolioOverview: FC = () => {
  const [view, setView] = useState('yield');
  const userDepositedPools = useUserDepositedPools();
  const usdBalance = useUserUsdBalance();
  const { t } = useTranslation();

  // TODO: Fetch real values
  const earnedYield = '30.24';
  const projectedYield = '42.78';

  return (
    <div>
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
        {!userDepositedPools.length && <PortfolioOverviewNoPositions />}
      </div>
    </div>
  );
};

export default PortfolioOverview;
