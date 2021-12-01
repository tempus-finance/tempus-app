import { useContext } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';

import './Term.scss';

const Term = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { language } = useContext(LanguageContext);

  const activePoolMaturityDate = staticPoolData[selectedPool.get()].maturityDate;
  const activePoolStartDate = staticPoolData[selectedPool.get()].startDate;

  return (
    <div className="tc__term">
      <Typography variant="card-title">{getText('term', language)}</Typography>
      <div className="tc__term__body">
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('startDate', language)}
          </Typography>
          <Typography variant="card-body-text">{format(activePoolStartDate.get(), 'dd MMM y')}</Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('maturity', language)}
          </Typography>
          <Typography variant="card-body-text">{format(activePoolMaturityDate.get(), 'dd MMM y')}</Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('timeLeft', language)}
          </Typography>
          <Typography variant="card-body-text">
            {formatDistanceStrict(Date.now(), activePoolMaturityDate.get(), { unit: 'day' })}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Term;
