import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHookstate } from '@hookstate/core';
import { selectedPoolState } from '../../state/PoolDataState';
import Operations from '../operations/Operations';

const PoolRoute = () => {
  const selectedPool = useHookstate(selectedPoolState);

  const params = useParams();

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

  return <Operations />;
};
export default PoolRoute;
