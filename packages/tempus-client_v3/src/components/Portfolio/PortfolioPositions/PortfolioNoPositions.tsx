import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionButton, Typography } from '../../shared';

const PortfolioNoPositions: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBrowseMarketsClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="tc__portfolio-positions__empty">
      <Typography variant="subtitle" weight="bold">
        {t('PortfolioPositions.titleNoPositions')}
      </Typography>
      <Typography variant="subtitle">{t('PortfolioPositions.descriptionNoPositions')}</Typography>
      <ActionButton
        labels={{ default: t('PortfolioPositions.buttonBrowseMarkets') }}
        variant="primary"
        size="large"
        onClick={handleBrowseMarketsClick}
      />
    </div>
  );
};

export default PortfolioNoPositions;
