import { useConnectWallet } from '@web3-onboard/react';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionButton, Typography } from '../../shared';

const PortfolioOverviewWalletNotConnected: FC = () => {
  const [, connect] = useConnectWallet();
  const { t } = useTranslation();

  const onConnectWallet = useCallback(async () => {
    await connect({});
  }, [connect]);

  return (
    <div className="tc__portfolio-wallet-not-connected-overlay">
      <div className="tc__portfolio-wallet-not-connected-overlay-mask" />
      <div className="tc__portfolio-wallet-not-connected-content">
        <Typography variant="subtitle" weight="bold">
          {t('PortfolioOverview.titleWalletNotConnected')}
        </Typography>
        <Typography variant="subtitle">{t('PortfolioOverview.descriptionWalletNotConnected')}</Typography>
        <ActionButton
          labels={{ default: t('PortfolioOverview.buttonConnectWallet') }}
          variant="primary"
          size="large"
          onClick={onConnectWallet}
        />
      </div>
    </div>
  );
};

export default PortfolioOverviewWalletNotConnected;
