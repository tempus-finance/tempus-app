import { useContext } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { format, formatDistanceStrict } from 'date-fns';
import { MILLISECONDS_IN_A_DAY, ZERO } from '../../../constants';
import { LanguageContext } from '../../../context/languageContext';
import getText from '../../../localisation/getText';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import { Chain, chainIdToChainName } from '../../../interfaces/Chain';
import getRangeFrom from '../../../utils/getRangeFrom';
import { isRariVisible } from '../../../utils/isRariVisible';
import { getChainConfigForPool } from '../../../utils/getConfig';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';

import './maturityFormatter.scss';

const MaturityFormatter = ({ value, row }: any) => {
  const { language } = useContext(LanguageContext);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const isParent = !row.parentId;

  if (isParent) {
    const [min, max] = getParentMaturity(row.id, row.chain, staticPoolData, dynamicPoolData);

    // In case parent row has a single child, we want to show time left to maturity for this child item in parent row
    const timeLeft = min - Date.now();
    let daysRemaining = formatDistanceStrict(Date.now(), min, { unit: 'day' });
    let hoursRemaining = formatDistanceStrict(Date.now(), min, { unit: 'hour' });

    // Pool matured
    if (timeLeft < 0) {
      daysRemaining = '0 days';
      hoursRemaining = '0 hours';
    }

    return (
      <>
        {/* If parent has multiple children - show earliest maturity and latest maturity dates */}
        {min && max && (
          <div>
            <div className="tf__dashboard__grid__maturity-row">
              <Typography variant="dash-maturity-label" color="label-gray">
                {getText('earliestMaturity', language)}
              </Typography>
              <div className="tf__dashboard__grid__maturity-date">
                <Typography variant="dash-maturity-date-bold">{format(min, 'd')}</Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold" color="title">
                  &#8226;
                </Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold">{format(min, 'MMM')}</Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold" color="title">
                  &#8226;
                </Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold">{format(min, 'yy')}</Typography>
              </div>
            </div>
            <div className="tf__dashboard__grid__maturity-row">
              <Typography variant="dash-maturity-label" color="label-gray">
                {getText('latestMaturity', language)}
              </Typography>
              <div className="tf__dashboard__grid__maturity-date">
                <Typography variant="dash-maturity-date-bold">{format(max, 'd')}</Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold" color="title">
                  &#8226;
                </Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold">{format(max, 'MMM')}</Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold" color="title">
                  &#8226;
                </Typography>
                <Spacer size={2} />
                <Typography variant="dash-maturity-date-bold">{format(max, 'yy')}</Typography>
              </div>
            </div>
          </div>
        )}

        {/* If parent has single child - show time left to maturity with time */}
        {min && !max && (
          <div>
            <Typography variant="dash-maturity-label" color="label-gray">
              {getText('timeToMaturity', language)}
            </Typography>
            <div className="tf__dashboard__grid__maturity-date">
              {timeLeft > MILLISECONDS_IN_A_DAY ? (
                <div className="tf__dashboard__grid__maturity-date">
                  <Typography variant="dash-maturity-date-bold">{daysRemaining.split(' ')[0]} </Typography>
                  <Spacer size={3} />
                  <Typography variant="dash-maturity-date">{daysRemaining.split(' ')[1]}</Typography>
                </div>
              ) : (
                <div className="tf__dashboard__grid__maturity-date">
                  <Typography variant="dash-maturity-date-bold">{hoursRemaining.split(' ')[0]} </Typography>
                  <Spacer size={3} />
                  <Typography variant="dash-maturity-date">{hoursRemaining.split(' ')[1]}</Typography>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Circle - If min and max maturities are missing */}
        {!min && !max && <CircularProgress size={16} />}
      </>
    );
  }

  if (!isParent) {
    const childMaturity = getChildMaturity(row.id, staticPoolData);

    const timeLeft = childMaturity - Date.now();
    const daysRemaining = formatDistanceStrict(Date.now(), childMaturity, { unit: 'day' });
    const hoursRemaining = formatDistanceStrict(Date.now(), childMaturity, { unit: 'hour' });

    const poolIsMature = childMaturity < Date.now();

    return (
      <>
        <Typography variant="dash-maturity-label" color="label-gray">
          {getText('timeToMaturity', language)}
        </Typography>

        {/* If pool is not mature show number of days/hours to maturity */}
        {!poolIsMature && (
          <>
            {timeLeft > MILLISECONDS_IN_A_DAY ? (
              <div className="tf__dashboard__grid__maturity-date">
                <Typography variant="dash-maturity-date-bold">{daysRemaining.split(' ')[0]} </Typography>
                <Spacer size={3} />
                <Typography variant="dash-maturity-date">{daysRemaining.split(' ')[1]}</Typography>
              </div>
            ) : (
              <div className="tf__dashboard__grid__maturity-date">
                <Typography variant="dash-maturity-date-bold">{hoursRemaining.split(' ')[0]} </Typography>
                <Spacer size={3} />
                <Typography variant="dash-maturity-date">{hoursRemaining.split(' ')[1]}</Typography>
              </div>
            )}
          </>
        )}

        <Spacer size={4} />

        {/* If pool is mature show 'Matured' label instead of number of days to maturity */}
        {poolIsMature && (
          <div className="tf__dashboard__grid__maturity-matured-label">
            <Typography variant="matured-dash-label" color="success">
              {getText('poolMatured', language)}
            </Typography>
          </div>
        )}
      </>
    );
  }
};

export default MaturityFormatter;

function getParentMaturity(
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): number[] {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId.toString())}` === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      // If rari child row is hidden, do not include it in parent row stats
      const { protocol } = staticPoolData[key];
      if (protocol === 'rari' && !isRariVisible(key, dynamicPoolData)) {
        continue;
      }

      parentChildrenAddresses.push(key);
    }
  }

  const childrenMaturityDates = parentChildrenAddresses.map(address => staticPoolData[address].maturityDate);

  if (childrenMaturityDates.length === 1) {
    return childrenMaturityDates;
  }

  return getRangeFrom<number>(childrenMaturityDates);
}

function getChildMaturity(childId: string, staticPoolData: StaticPoolDataMap): number {
  return staticPoolData[childId].maturityDate;
}
