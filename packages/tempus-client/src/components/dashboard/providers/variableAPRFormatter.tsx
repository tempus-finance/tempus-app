import { useContext, useMemo } from 'react';
import { Context, ContextPoolData, getDataForPool } from '../../../context';
import { Ticker } from '../../../interfaces';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';

const VariableAPRFormatter = ({ row }: any) => {
  const { data } = useContext(Context);

  const isChild = Boolean(row.parentId);

  const apr = useMemo(() => {
    if (isChild) {
      return getChildAPR(row.id, data.poolData);
    } else {
      return getParentAPR(row.id, data.poolData);
    }
  }, [data.poolData, isChild, row.id]);

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
export default VariableAPRFormatter;

function getParentAPR(parentId: Ticker, poolData: ContextPoolData[]): number {
  const parentChildren = poolData.filter(data => {
    return data.backingTokenTicker === parentId;
  });

  const childrenFixedAPR = parentChildren.map(child => child.variableAPR).filter(variableAPR => variableAPR !== null);

  return Math.max(...childrenFixedAPR);
}

function getChildAPR(id: string, poolData: ContextPoolData[]): number {
  return getDataForPool(id, poolData).variableAPR;
}
