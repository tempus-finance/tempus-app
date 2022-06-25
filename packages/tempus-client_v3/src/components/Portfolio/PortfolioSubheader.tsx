import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavSubheader, NavSubheaderGroup, Tab, Tabs } from '../shared';

export type PortfolioView = 'overview' | 'positions';

const PortfolioSubheader: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const handleViewChange = useCallback(
    (view: PortfolioView) => {
      navigate(`/portfolio/${view}`);
    },
    [navigate],
  );

  // Extract current view from URL (overview or positions)
  const currentView = useMemo(() => pathname.substring(pathname.lastIndexOf('/') + 1), [pathname]);

  return (
    <NavSubheader align="center">
      <NavSubheaderGroup>
        <Tabs size="small" value={currentView} onTabSelected={handleViewChange}>
          <Tab
            label={t('PortfolioSubheader.tabOverview')}
            hrefPatterns={['/portfolio/overview', '/portfolio/overview/*']}
            value="overview"
          />
          <Tab
            label={t('PortfolioSubheader.tabPositions')}
            hrefPatterns={['/portfolio/positions', '/portfolio/positions/*']}
            value="positions"
          />
        </Tabs>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};

export default PortfolioSubheader;
