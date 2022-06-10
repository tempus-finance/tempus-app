import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { Decimal as MockDecimal, ZERO as MOCK_ZERO } from 'tempus-core-services';
import {
  pool1 as mockPool1,
  pool1,
  pool2 as mockPool2,
  pool3 as mockPool3,
  pool3,
  pool4 as mockPool4,
  pool4,
  pool5 as mockPool5,
  pool5,
} from '../setupTests';
import { useUserDepositedPools } from './useUserDepositedPools';

jest.mock('./usePoolList', () => ({
  ...jest.requireActual('./usePoolList'),
  poolList$: mockOf([mockPool1, mockPool2, mockPool3, mockPool4, mockPool5]),
}));

jest.mock('./useTokenBalance', () => ({
  ...jest.requireActual('./useTokenBalance'),
  tokenBalanceMap$: mockOf({
    [`${mockPool1.chain}-${mockPool1.principalsAddress}`]: new MockDecimal(1),
    [`${mockPool2.chain}-${mockPool2.principalsAddress}`]: MOCK_ZERO,
    [`${mockPool3.chain}-${mockPool3.yieldsAddress}`]: new MockDecimal(2),
    [`${mockPool4.chain}-${mockPool4.ammAddress}`]: new MockDecimal(3),
    [`${mockPool5.chain}-${mockPool5.principalsAddress}`]: new MockDecimal(4),
    [`${mockPool5.chain}-${mockPool5.yieldsAddress}`]: new MockDecimal(4),
  }),
}));

describe('useUserDepositedPools', () => {
  it('fetches all pools that user deposited into', async () => {
    const { result } = renderHook(() => useUserDepositedPools());

    expect(result.current).toEqual([pool1, pool3, pool4, pool5]);
  });
});
