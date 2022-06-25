import { useConnectWallet } from '@web3-onboard/react';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionButton, Typography } from '../../shared';

const PortfolioPositionsWalletNotConnected: FC = () => {
  const [, connect] = useConnectWallet();
  const { t } = useTranslation();

  const onConnectWallet = useCallback(async () => {
    await connect({});
  }, [connect]);

  return (
    <div className="tc__portfolio-positions__empty">
      <Typography variant="subtitle" weight="bold">
        {t('PortfolioPositions.titleWalletNotConnected')}
      </Typography>
      <Typography variant="subtitle">{t('PortfolioPositions.descriptionWalletNotConnected')}</Typography>
      <ActionButton
        labels={{ default: t('PortfolioPositions.buttonConnectWallet') }}
        variant="primary"
        size="large"
        onClick={onConnectWallet}
      />
    </div>
  );
};

export default PortfolioPositionsWalletNotConnected;
