import { FC, memo } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import { useTvlData } from '../../hooks';
import { Typography } from '../shared';

import './TotalValueLocked.scss';

const TotalValueLocked: FC = () => {
  const tvl = useTvlData();

  return (
    <div className="tc__totalValueLocked">
      <Typography variant="body-secondary" color="text-primary-inverted">
        Total Value Locked
      </Typography>
      <Typography variant="subtitle" color="text-primary-inverted" type="mono">
        {tvl && DecimalUtils.formatToCurrency(tvl, 2, '$')}
      </Typography>
    </div>
  );
};

export default memo(TotalValueLocked);
