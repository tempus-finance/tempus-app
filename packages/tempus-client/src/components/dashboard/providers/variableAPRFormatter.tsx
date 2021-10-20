import { useContext } from 'react';
import { Context, ContextPoolData } from '../../../context';
import { Ticker } from '../../../interfaces';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';

const TVLFormatter = ({ row }: any) => {
  const { data } = useContext(Context);

  const isParent = Boolean(row.parentId);

  if (!isParent) {
    const parentARP = getParentAPR(row.id, data.poolData);

    return (
      <div className="tf__dashboard__body__apy">
        <Typography color="default" variant="body-text">
          Up to&nbsp;
        </Typography>
        <Typography color={parentARP > 0.2 ? 'accent' : 'default'} variant="body-text">
          {NumberUtils.formatPercentage(parentARP, 2)}
        </Typography>
      </div>
    );
  }

  const childAPR = getChildAPR(row.id, data.poolData);

  // If it's a child row
  return (
    <div className="tf__dashboard__body__apy">
      <APYGraph apy={childAPR} />
      <div className="tf__dashboard__body__apy-value">{NumberUtils.formatPercentage(childAPR, 2)}</div>
    </div>
  );
};
export default TVLFormatter;

function getParentAPR(parentId: Ticker, poolData: ContextPoolData[]): number {
  const parentChildren = poolData.filter(data => {
    return data.backingTokenTicker === parentId;
  });

  const childrenFixedAPR = parentChildren.map(child => child.variableAPR).filter(variableAPR => variableAPR !== null);

  return Math.max(...childrenFixedAPR);
}

function getChildAPR(id: string, poolData: ContextPoolData[]): number {
  const childData = poolData.find(data => data.address === id);

  return childData?.variableAPR || 0;
}
