import { useTranslation } from 'react-i18next';
import { Icon, Typography } from '../shared';
import LiquidityProvisionSubheader from './LiquidityProvisionSubheader';

import './LiquidityProvision.scss';

const LiquidityProvision = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="tc__liquidityProvision">
      <LiquidityProvisionSubheader />
      <div className="tc__liquidityProvision-content">
        <Icon variant="magic-wand" size={80} />
        <Typography variant="subtitle" weight="bold">
          {t('LiquidityProvision.comingSoonTitle')}
        </Typography>
        <Typography variant="subtitle">{t('LiquidityProvision.comingSoonDescription')}</Typography>
      </div>
    </div>
  );
};
export default LiquidityProvision;
