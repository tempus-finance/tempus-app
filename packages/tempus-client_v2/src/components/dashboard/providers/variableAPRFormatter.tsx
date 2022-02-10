import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ZERO } from '../../../constants';
import { Chain } from '../../../interfaces/Chain';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import APYGraph from '../bodySection/apyGraph';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';
import InfoTooltip from '../../infoTooltip/infoTooltip';
import VariableAPRBreakDownTooltip from '../popups/variableAPRBreakDownTooltip';

const VariableAPRFormatter = ({ row }: any) => {
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const isChild = Boolean(row.parentId);
  // if useMemo is used here, anything inside dynamicPoolData state changes
  //  this use memo will not re-run, and APR will stay the same. so skip using useMemo here
  const apr = isChild
    ? getChildAPR(row.id, dynamicPoolData)
    : getParentAPR(row.id, row.chain, staticPoolData, dynamicPoolData);

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
  const fees = dynamicPoolData[row.id].tempusFees;
  const protocolName = row.tempusPool.protocolDisplayName;
  const tooltipContent = <VariableAPRBreakDownTooltip protocolName={protocolName} apr={apr} tempusFees={fees || 0} />;

  return (
    <div className="tf__dashboard__body__apy">
      <APYGraph apy={apr} />
      <div className="tf__dashboard__body__apy-value">
        <InfoTooltip content={tooltipContent}>
          <Typography color="default" variant="body-text" className="tf__dashboard__body__apy-anchor">
            {NumberUtils.formatPercentage(apr, 2)}
          </Typography>
        </InfoTooltip>
      </div>
    </div>
  );
};
export default VariableAPRFormatter;

function getParentAPR(
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): number | null {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      `${staticPoolData[key].backingToken}-${chain}` === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  const childrenVariableAPR = parentChildrenAddresses
    .map(address => {
      return dynamicPoolData[address].variableAPR;
    })
    .filter(variableAPR => variableAPR !== null) as number[];

  if (childrenVariableAPR.length === 0) {
    return null;
  }

  return Math.max(...childrenVariableAPR);
}

function getChildAPR(id: string, dynamicPoolData: DynamicPoolStateData): number | null {
  return dynamicPoolData[id].variableAPR;
}
