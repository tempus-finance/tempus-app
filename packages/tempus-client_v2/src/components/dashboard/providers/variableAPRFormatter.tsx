import { Downgraded, useState as useHookState } from '@hookstate/core';
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
  StaticPoolStateData,
} from '../../../state/PoolDataState';

const VariableAPRFormatter = ({ row }: any) => {
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const isChild = Boolean(row.parentId);

  const getAPR = () => {
    if (isChild) {
      return getChildAPR(row.id, dynamicPoolData);
    } else {
      return getParentAPR(row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData);
    }
  };
  const apr = getAPR();

  if (!isChild) {
    return (
      apr && (
        <div className="tf__dashboard__body__apy">
          <Typography color="default" variant="body-text">
            Up to&nbsp;
          </Typography>
          <Typography color={apr > 0.2 ? 'accent' : 'default'} variant="body-text">
            {NumberUtils.formatPercentage(apr, 2)}
          </Typography>
        </div>
      )
    );
  }

  // If it's a child row
  return (
    apr && (
      <div className="tf__dashboard__body__apy">
        <APYGraph apy={apr} />
        <div className="tf__dashboard__body__apy-value">
          <Typography color="default" variant="body-text">
            {NumberUtils.formatPercentage(apr, 2)}
          </Typography>
        </div>
      </div>
    )
  );
};
export default VariableAPRFormatter;

function getParentAPR(
  parentId: Ticker,
  staticPoolData: StaticPoolStateData,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): number {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!negativeYieldPoolData[key] || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  const childrenVariableAPR = parentChildrenAddresses
    .map(address => {
      return dynamicPoolData[address].variableAPR;
    })
    .filter(variableAPR => variableAPR !== null) as number[];

  return Math.max(...childrenVariableAPR);
}

function getChildAPR(id: string, dynamicPoolData: DynamicPoolStateData): number | null {
  return dynamicPoolData[id].variableAPR;
}
