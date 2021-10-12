import { FC, useContext, useEffect } from 'react';
import PoolDataAdapter from '../adapters/PoolDataAdapter';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import { mul18f } from '../utils/wei-math';

interface PresentValueProviderProps {
  poolDataAdapter: PoolDataAdapter;
  tempusPool: TempusPool;
}

const PresentValueProvider: FC<PresentValueProviderProps> = props => {
  const { poolDataAdapter, tempusPool } = props;

  const { setData, data } = useContext(Context);

  /**
   * Update user pool value when user balance for any of the pool tokens (Principals, Yields, LP Tokens) changes.
   */
  useEffect(() => {
    const updateValue = async () => {
      if (!setData) {
        return;
      }

      const [valueInBackingTokens, backingTokenRate] = await Promise.all([
        poolDataAdapter.getPresentValueInBackingTokensForPool(tempusPool, data.userWalletAddress),
        poolDataAdapter.getBackingTokenRate(tempusPool.backingToken),
      ]);

      setData(prevData => ({
        ...prevData,
        userCurrentPoolPresentValue: mul18f(valueInBackingTokens, backingTokenRate),
      }));
    };
    updateValue();
  }, [
    data.userWalletAddress,
    poolDataAdapter,
    setData,
    tempusPool,
    data.userPrincipalsBalance,
    data.userYieldsBalance,
    data.userLPBalance,
  ]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default PresentValueProvider;
