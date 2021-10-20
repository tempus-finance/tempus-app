import { FC, useContext, useEffect } from 'react';
import { combineLatest } from 'rxjs';
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
    if (!setData) {
      return;
    }

    const getBackingTokenRate$ = poolDataAdapter.getBackingTokenRate(tempusPool.backingToken);
    const getPresentValueInBackingTokensForPool$ = poolDataAdapter.getPresentValueInBackingTokensForPool(
      tempusPool,
      data.userWalletAddress,
    );

    const stream = combineLatest([getBackingTokenRate$, getPresentValueInBackingTokensForPool$]).subscribe(
      ([valueInBackingTokens, backingTokenRate]) => {
        setData(prevData => ({
          ...prevData,
          userCurrentPoolPresentValue: mul18f(valueInBackingTokens, backingTokenRate),
        }));
      },
    );

    return () => stream.unsubscribe();
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
