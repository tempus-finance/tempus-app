import { useContext, useMemo } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';

import './Term.scss';

const Term = () => {
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  return (
    <div className="tc__term">
      <Typography variant="card-title">{getText('term', language)}</Typography>
      <div className="tc__term__body">
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('startDate', language)}
          </Typography>
          <Typography variant="card-body-text">{format(activePoolData.startDate, 'dd MMM y')}</Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('maturity', language)}
          </Typography>
          <Typography variant="card-body-text">{format(activePoolData.maturityDate, 'dd MMM y')}</Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('timeLeft', language)}
          </Typography>
          <Typography variant="card-body-text">
            {formatDistanceStrict(activePoolData.startDate, activePoolData.maturityDate, { unit: 'day' })}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Term;
