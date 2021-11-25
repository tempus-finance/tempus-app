import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
import { ZERO } from '../../../constants';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';

const FixedAPRFormatter = ({ row }: any) => {
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const isChild = Boolean(row.parentId);

  const getApr = () => {
    if (isChild) {
      return getChildAPR(row.id, dynamicPoolData);
    } else {
      return getParentAPR(row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData);
    }
  };
  const apr = getApr();

  // In case APR is unavailable - for example when pool does not have any
  // liquidity it's not possible to calculate fixed APR
  if (apr === 'unavailable') {
    return <Typography variant="body-text">-</Typography>;
  }

  // In case APR is still loading - show loading circle
  if (apr === null) {
    return <CircularProgress size={16} />;
  }

  if (!isChild) {
    return (
      <div className="tf__dashboard__body__apy">
        <Typography color="default" variant="body-text">
          Up to&nbsp;
        </Typography>
        <Typography color={apr > 0.2 ? 'accent' : 'default'} variant="body-text">
          {NumberUtils.formatPercentage(apr, 2)}
        </Typography>
      </div>
    );
  }

  // If it's a child row
  return (
    <div className="tf__dashboard__body__apy">
      <APYGraph apy={apr} />
      <div className="tf__dashboard__body__apy-value">
        <Typography color="default" variant="body-text">
          {NumberUtils.formatPercentage(apr, 2)}
        </Typography>
      </div>
    </div>
  );
};
export default FixedAPRFormatter;

function getParentAPR(
  parentId: Ticker,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): number | null | 'unavailable' {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!negativeYieldPoolData[key] || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  const childrenStillLoading =
    parentChildrenAddresses.length === 0 ||
    parentChildrenAddresses.some(address => dynamicPoolData[address].fixedAPR === null);
  if (childrenStillLoading) {
    return null;
  }

  const childrenFixedAPR: number[] = parentChildrenAddresses
    .map(address => {
      return dynamicPoolData[address].fixedAPR;
    })
    .filter(fixedAPR => fixedAPR !== 'unavailable') as number[];

  if (childrenFixedAPR.length === 0) {
    return 'unavailable';
  }

  return Math.max(...childrenFixedAPR);
}

function getChildAPR(id: string, dynamicPoolData: DynamicPoolStateData): number | null | 'unavailable' {
  return dynamicPoolData[id].fixedAPR;
}
