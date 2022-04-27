import { FC, useCallback, useState } from 'react';
import { NavSubheader, NavSubheaderGroup, Tab, Tabs } from '../shared';

type PortfolioView = 'overview' | 'positions';

interface PortfolioSubheaderProps {
  onViewChange?: (view: PortfolioView) => void;
}

const PortfolioSubheader: FC<PortfolioSubheaderProps> = props => {
  const { onViewChange } = props;
  const [selectedView, setSelectedView] = useState<PortfolioView>('overview');
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
          <Tab label="Overview" value="overview" />
          <Tab label="Positions" value="positions" />
        </Tabs>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};

export default PortfolioSubheader;
