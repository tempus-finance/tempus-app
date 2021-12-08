import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Downgraded, useHookstate } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState } from '../../state/PoolDataState';
import Operations from '../operations/Operations';

const PoolRoute = () => {
  const selectedPool = useHookstate(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);

  const [poolShareBalanceLoaded, setPoolShareBalanceLoaded] = useState<boolean>(false);

  const params = useParams();

  let poolShareBalance: {
    principals: BigNumber | null;
    yields: BigNumber | null;
  } = {
    principals: null,
    yields: null,
  };
  if (params.poolAddress) {
    poolShareBalance = dynamicPoolData[params.poolAddress].poolShareBalance.attach(Downgraded).get();
  }

  useEffect(() => {
    if (params.poolAddress) {
      if (poolShareBalance.principals && poolShareBalance.yields) {
        setPoolShareBalanceLoaded(true);
      }
    }
  }, [params.poolAddress, poolShareBalance.principals, poolShareBalance.yields]);

  useEffect(() => {
    if (params.poolAddress) {
      // TODO - Refactor whole app to use pool address from URL instead of using it from state
      selectedPool.set(params.poolAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.poolAddress]);

  if (!selectedPool.get()) {
    return null;
  }

  // Do not show pool UI before all required data is loaded
  // Triggered when user opens direct pool link
  if (!poolShareBalanceLoaded) {
    return null;
  }

  return <Operations />;
};
export default PoolRoute;
