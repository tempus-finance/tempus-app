import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { Decimal, Decimal as MockDecimal } from 'tempus-core-services';
import { pool1 as mockPool1, pool2 as mockPool2, pool3 as mockPool3 } from '../setupTests';
import { PoolBalance } from './usePoolBalance';
import { useUserUsdBalance } from './useUserUsdBalance';

jest.mock('./usePoolBalance', () => ({
  ...jest.requireActual('./usePoolBalance'),
  poolBalances$: mockOf({
    [`${mockPool1.chain}-${mockPool1.address}`]: {
      balanceInBackingToken: new MockDecimal(1.1),
      balanceInYieldBearingToken: new MockDecimal(1.1),
      balanceInUsd: new MockDecimal(123.45),
    },
    [`${mockPool2.chain}-${mockPool2.address}`]: {
      balanceInBackingToken: new MockDecimal(1.1),
      balanceInYieldBearingToken: new MockDecimal(1.1),
      balanceInUsd: new MockDecimal(12.34),
    },
    [`${mockPool3.chain}-${mockPool3.address}`]: {
      balanceInBackingToken: null,
      balanceInYieldBearingToken: null,
      balanceInUsd: null,
    },
  } as { [mockId: string]: PoolBalance }),
}));

describe('useUserUsdBalance', () => {
  it('returns sum of balances in USD', async () => {
    const { result } = renderHook(() => useUserUsdBalance());

    expect(result.current).toEqual(new Decimal(135.79));
  });
});
