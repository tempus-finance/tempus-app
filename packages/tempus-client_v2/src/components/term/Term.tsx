import { FC, useContext, useEffect, useState } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { LocaleContext } from '../../context/localeContext';
import { Locale } from '../../interfaces/Locale';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';

import './Term.scss';

const TimeLeftFormatter: FC<{ maturityDate: number; locale: Locale }> = ({ maturityDate, locale }) => {
  const [timeLeft, setTimeLeft] = useState(maturityDate - Date.now());

  useEffect(() => {
    if (timeLeft < 0) {
      return;
    }

    let updateInterval;

    // For last 2 time units (hours and minutes), the timer will tick faster (for example, for last 2 minutes the timer
    // will tick every second instead of every minute). This is to prevent the situation where time to mature is between
    // 1 and 2 minutes and the next timer's tick would happen in the middle of the last minute instead of before.
    if (timeLeft >= 7200000) {
      updateInterval = 3600000;
    } else if (timeLeft >= 120000) {
      updateInterval = 60000;
    } else {
      updateInterval = 1000;
    }

    const timer = setTimeout(() => setTimeLeft(maturityDate - Date.now()), updateInterval);

    return () => {
      clearTimeout(timer);
    };
  }, [timeLeft, maturityDate]);

  // In case pool is mature, we want to show 'Pool Matured' label instead of number of days left to maturity
  if (timeLeft < 0) {
    return <Typography variant="card-body-text">{getText('matured', locale)}</Typography>;
  }

  let formattedValue;
  if (timeLeft > 86400000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'day', locale: locale.dateLocale });
  } else if (timeLeft > 3600000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'hour', locale: locale.dateLocale });
  } else if (timeLeft > 60000) {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'minute', locale: locale.dateLocale });
  } else {
    formattedValue = formatDistanceStrict(Date.now(), maturityDate, { unit: 'second', locale: locale.dateLocale });
  }
  return <Typography variant="card-body-text">{formattedValue}</Typography>;
};

const Term = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { locale } = useContext(LocaleContext);

  const activePoolMaturityDate = staticPoolData[selectedPool.get()].maturityDate;
  const activePoolStartDate = staticPoolData[selectedPool.get()].startDate;

  return (
    <div className="tc__term">
      <Typography variant="card-title">{getText('term', locale)}</Typography>
      <div className="tc__term__body">
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('startDate', locale)}
          </Typography>
          <Typography variant="card-body-text">
            {format(activePoolStartDate.get(), 'dd MMM y', { locale: locale.dateLocale })}
          </Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('maturity', locale)}
          </Typography>
          <Typography variant="card-body-text">
            {format(activePoolMaturityDate.get(), 'dd MMM y', { locale: locale.dateLocale })}
          </Typography>
        </div>
        <div className="tc__term__body__item">
          <Typography variant="card-body-text" color="title">
            {getText('timeLeft', locale)}
          </Typography>
          <TimeLeftFormatter maturityDate={activePoolMaturityDate.get()} locale={locale} />
        </div>
      </div>
    </div>
  );
};

export default Term;
