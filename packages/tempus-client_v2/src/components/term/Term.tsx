import { FC, useContext } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { LocaleContext } from '../../context/localeContext';
import { Locale } from '../../interfaces/Locale';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';

import './Term.scss';

const TimeLeftFormatter: FC<{ maturityDate: number; locale: Locale }> = ({ maturityDate, locale }) => {
  const timeLeft = maturityDate - Date.now();
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
