import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionButton, Typography } from '../../shared';

import './PortfolioOverview.scss';

const PortfolioOverviewNoPositions: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBrowseMarketsClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="tc__portfolio-overview__empty">
      <div className="tc__portfolio-overview__empty-blurred-background" />
      <div className="tc__portfolio-overview__empty-content">
        <Typography variant="subtitle" weight="bold">
          {t('PortfolioOverview.titleNoPositions')}
        </Typography>
        <Typography variant="subtitle">{t('PortfolioOverview.descriptionNoPositions')}</Typography>
        <ActionButton
          labels={{ default: t('PortfolioOverview.buttonBrowseMarkets') }}
          variant="primary"
          size="large"
          onClick={handleBrowseMarketsClick}
        />
      </div>
    </div>
  );
};

export default PortfolioOverviewNoPositions;
