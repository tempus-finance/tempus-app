import { useContext, useMemo } from 'react';
import { ContextPoolData, getDataForPool, PoolDataContext } from '../../../context/poolData';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';

const FixedAPRFormatter = ({ row }: any) => {
  const { poolData } = useContext(PoolDataContext);

  const isChild = Boolean(row.parentId);

  const apr = useMemo(() => {
    if (isChild) {
      return getChildAPR(row.id, poolData);
    } else {
      return getParentAPR(row.id, poolData);
    }
  }, [poolData, isChild, row.id]);

  if (!apr) {
    return <Typography variant="body-text">-</Typography>;
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
      <div className="tf__dashboard__body__apy-value">{NumberUtils.formatPercentage(apr, 2)}</div>
    </div>
  );
};
export default FixedAPRFormatter;

function getParentAPR(parentId: Ticker, poolData: ContextPoolData[]): number | null {
  const parentChildren = poolData.filter(data => {
    return data.backingTokenTicker === parentId;
  });

  const childrenFixedAPR: number[] = parentChildren
    .map(child => child.fixedAPR)
    .filter(fixedAPR => fixedAPR !== null) as number[];
  if (childrenFixedAPR.length === 0) {
    return null;
  }

  return Math.max(...childrenFixedAPR);
}

function getChildAPR(id: string, poolData: ContextPoolData[]): number | null {
  return getDataForPool(id, poolData).fixedAPR;
}
