import { useContext } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
import { ZERO } from '../../../constants';
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
import getText from '../../../localisation/getText';
import { LanguageContext } from '../../../context/languageContext';

const FixedAPRFormatter = ({ row }: any) => {
  const { language } = useContext(LanguageContext);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const isChild = Boolean(row.parentId);

  const getApr = () => {
    if (isChild) {
      return getChildAPR(row.id, dynamicPoolData);
    } else {
      return getParentAPR(row.id, row.chain, staticPoolData, dynamicPoolData);
    }
  };
  const apr = getApr();

  // In case APR is unavailable - for example when pool does not have any
  // liquidity it's not possible to calculate fixed APR
  if (apr === null) {
    return <Typography variant="body-text">-</Typography>;
  }

  // In case APR is still loading - show loading circle
  if (apr === 'fetching') {
    return <CircularProgress size={16} />;
  }

  if (!isChild) {
    return (
      <div className="tf__dashboard__body__apy">
        <Typography color="default" variant="body-text">
          {getText('upTo', language)}&nbsp;
        </Typography>
        <Typography variant="body-text">{NumberUtils.formatPercentage(apr, 2)}</Typography>
      </div>
    );
  }

  // If it's a child row
  return (
    <div className="tf__dashboard__body__apy">
      <Typography color="default" variant="body-text">
        {NumberUtils.formatPercentage(apr, 2)}
      </Typography>
    </div>
  );
};
export default FixedAPRFormatter;

function getParentAPR(
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): number | null | 'fetching' {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId.toString())}` === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  const childrenStillLoading =
    parentChildrenAddresses.length === 0 ||
    parentChildrenAddresses.some(address => dynamicPoolData[address].fixedAPR === 'fetching');
  if (childrenStillLoading) {
    return 'fetching';
  }

  const childrenFixedAPR: number[] = parentChildrenAddresses
    .map(address => {
      return dynamicPoolData[address].fixedAPR;
    })
    .filter(fixedAPR => fixedAPR !== null) as number[];

  if (childrenFixedAPR.length === 0) {
    return null;
  }

  return Math.max(...childrenFixedAPR);
}

function getChildAPR(id: string, dynamicPoolData: DynamicPoolStateData): number | null | 'fetching' {
  return dynamicPoolData[id].fixedAPR;
}
