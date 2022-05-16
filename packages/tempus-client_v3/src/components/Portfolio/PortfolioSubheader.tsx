import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavSubheader, NavSubheaderGroup, Tab, Tabs } from '../shared';

export type PortfolioView = 'overview' | 'positions';

export interface PortfolioSubheaderProps {
  onViewChange?: (view: PortfolioView) => void;
}

const PortfolioSubheader: FC<PortfolioSubheaderProps> = props => {
  const { onViewChange } = props;
  const [selectedView, setSelectedView] = useState<PortfolioView>('overview');
  const { t } = useTranslation();

  const handleViewChange = useCallback(
    (view: PortfolioView) => {
      setSelectedView(view);
      onViewChange?.(view);
    },
    [onViewChange],
  );

  return (
    <NavSubheader>
      <NavSubheaderGroup>
        <Tabs size="small" value={selectedView} onTabSelected={handleViewChange}>
          <Tab label={t('PortfolioSubheader.tabOverview')} value="overview" />
          <Tab label={t('PortfolioSubheader.tabPositions')} value="positions" />
        </Tabs>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};

export default PortfolioSubheader;
