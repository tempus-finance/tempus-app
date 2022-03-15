import { useContext } from 'react';
import { CONSTANTS } from 'tempus-core-services';
import { CircularProgress } from '@material-ui/core';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { Chain, chainIdToChainName } from '../../../interfaces/Chain';
import NumberUtils from '../../../services/NumberUtils';
import { getChainConfigForPool } from '../../../utils/getConfig';
import Typography from '../../typography/Typography';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';
import InfoTooltip from '../../infoTooltip/infoTooltip';
import VariableAPRBreakDownTooltip from '../popups/variableAPRBreakDownTooltip';
import getText from '../../../localisation/getText';
import { LocaleContext } from '../../../context/localeContext';

const { ZERO } = CONSTANTS;

const VariableAPRFormatter = ({ row }: any) => {
  const { locale } = useContext(LocaleContext);

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
          {getText('upTo', locale)}&nbsp;
        </Typography>
        <Typography variant="body-text">{NumberUtils.formatPercentage(apr, 2)}</Typography>
      </div>
    );
  }

  // If it's a child row
  const fees = dynamicPoolData[row.id].tempusFees;
  const protocolName = row.tempusPool.protocolDisplayName;
  const tooltipContent = <VariableAPRBreakDownTooltip protocolName={protocolName} apr={apr} tempusFees={fees || 0} />;

  return (
    <div className="tf__dashboard__body__apy">
      <InfoTooltip content={tooltipContent}>
        <Typography color="default" variant="body-text" className="tf__dashboard__body__apy-anchor">
          {NumberUtils.formatPercentage(apr, 2)}
        </Typography>
      </InfoTooltip>
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
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId)}` === parentId &&
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
