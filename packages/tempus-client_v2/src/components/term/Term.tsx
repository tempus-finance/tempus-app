import { FC, useContext } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';

import './Term.scss';

const TimeLeftFormatter: FC<{ maturityDate: number }> = ({ maturityDate }) => {
  const timeLeft = maturityDate - Date.now();
  let formattedValue;
  if (timeLeft > 86400000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'day' });
  } else if (timeLeft > 3600000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'hour' });
  } else if (timeLeft > 60000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'minute' });
  } else {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'second' });
  }
  return <Typography variant="card-body-text">{formattedValue}</Typography>;
};

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
          <TimeLeftFormatter maturityDate={activePoolMaturityDate.get()} />
        </div>
      </div>
    </div>
  );
};

export default Term;
