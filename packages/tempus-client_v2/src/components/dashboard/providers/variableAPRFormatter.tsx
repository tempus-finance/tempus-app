import { useContext, useMemo } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ZERO } from '../../../constants';
import { PoolData, PoolDataContext } from '../../../context/poolDataContext';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
} from '../../../state/PoolDataState';

const VariableAPRFormatter = ({ row }: any) => {
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const { poolData } = useContext(PoolDataContext);

  const isChild = Boolean(row.parentId);

  const apr = useMemo(() => {
    if (isChild) {
      return getChildAPR(row.id, dynamicPoolData);
    } else {
      return getParentAPR(row.id, poolData, dynamicPoolData, negativeYieldPoolData);
    }
  }, [isChild, row.id, poolData, dynamicPoolData, negativeYieldPoolData]);

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
  poolData: PoolData[],
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): number {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  const childrenVariableAPR = parentChildren
    .map(child => {
      if (negativeYieldPoolData[child.address] && dynamicPoolData[child.address].userBalanceUSD?.lte(ZERO)) {
        return Number.MIN_SAFE_INTEGER;
      }
      return dynamicPoolData[child.address].variableAPR || 0;
    })
    .filter(variableAPR => variableAPR !== null);

  return Math.max(...childrenVariableAPR);
}

function getChildAPR(id: string, dynamicPoolData: DynamicPoolStateData): number | null {
  return dynamicPoolData[id].variableAPR;
}
