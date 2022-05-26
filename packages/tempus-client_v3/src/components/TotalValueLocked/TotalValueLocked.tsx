import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { DecimalUtils } from 'tempus-core-services';
import { useTotalTvl } from '../../hooks';
import { Typography } from '../shared';

import './TotalValueLocked.scss';

const TotalValueLocked: FC = () => {
  const { t } = useTranslation();
  const tvl = useTotalTvl();

  return (
    <div className="tc__totalValueLocked">
      <Typography variant="body-secondary" color="text-primary-inverted">
        {t('TotalValueLocked.title')}
      </Typography>
      <Typography variant="subtitle" color="text-primary-inverted" type="mono">
        {tvl && DecimalUtils.formatToCurrency(tvl, 2, '$')}
      </Typography>
    </div>
  );
};

export default memo(TotalValueLocked);
