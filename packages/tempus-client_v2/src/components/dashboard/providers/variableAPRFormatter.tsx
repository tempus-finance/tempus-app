import { useContext, useMemo } from 'react';
import { ZERO } from '../../../constants';
import { PoolData, getDataForPool, PoolDataContext } from '../../../context/poolDataContext';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';

const VariableAPRFormatter = ({ row }: any) => {
  const { poolData } = useContext(PoolDataContext);

  const isChild = Boolean(row.parentId);

  const apr = useMemo(() => {
    if (isChild) {
      return getChildAPR(row.id, poolData);
    } else {
      return getParentAPR(row.id, poolData);
    }
  }, [poolData, isChild, row.id]);

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
export default VariableAPRFormatter;

function getParentAPR(parentId: Ticker, poolData: PoolData[]): number {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  const childrenVariableAPR = parentChildren
    .map(child => {
      if (child.isNegativeYield && child.userBalanceUSD?.lte(ZERO)) {
        return Number.MIN_SAFE_INTEGER;
      }
      return child.variableAPR;
    })
    .filter(variableAPR => variableAPR !== null);

  return Math.max(...childrenVariableAPR);
}

function getChildAPR(id: string, poolData: PoolData[]): number {
  return getDataForPool(id, poolData).variableAPR;
}
