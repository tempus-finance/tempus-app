import { useTranslation } from 'react-i18next';
import { Icon, Typography } from '../shared';
import StakingSubheader from './StakingSubheader';

import './Staking.scss';

const Staking = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="tc__staking">
      <StakingSubheader />
      <div className="tc__staking-content">
        <Icon variant="magic-wand" size={80} />
        <Typography variant="subtitle" weight="bold">
          {t('Staking.comingSoonTitle')}
        </Typography>
        <Typography variant="subtitle">{t('Staking.comingSoonDescription')}</Typography>
      </div>
    </div>
  );
};
export default Staking;
