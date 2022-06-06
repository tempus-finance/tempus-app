import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Decimal, Decimal as MockDecimal, TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool4, pool4 as mockPool4, pool5, pool5 as mockPool5 } from '../setupTests';
import { setTempusPoolsForDepositModal, useDepositModalData } from './useDepositModalData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useTokenRates', () => ({
  ...jest.requireActual('./useTokenRates'),
  tokenRates$: mockOf({
    [`${mockPool4.chain}-${mockPool4.backingTokenAddress}`]: new MockDecimal(1900),
    [`${mockPool4.chain}-${mockPool4.yieldBearingTokenAddress}`]: new MockDecimal(1950),
  }),
}));

jest.mock('./useFixedAprs', () => ({
  ...jest.requireActual('./useFixedAprs'),
  poolAprs$: mockOf({
    // principalsAmount = 23.45
    [`${mockPool4.chain}-${mockPool4.address}`]: new MockDecimal('38.2908878504672893'),
    // principalsAmount = 104.5678
    [`${mockPool5.chain}-${mockPool5.address}`]: new MockDecimal('29.689311594202900145'),
  }).pipe(mockDelay(100)),
}));

describe('useDepositModal', () => {
  beforeAll(getConfigManager);

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2022, 4, 15).getTime());
  });

  it('returns values from the selected pool', async () => {
    const useDepositModalProps = useDepositModalData();
    const { result, waitForNextUpdate } = renderHook(() => useDepositModalProps());

    expect(result.current).toEqual(null);

    await act(async () => {
      setTempusPoolsForDepositModal([pool4 as TempusPool, pool5 as TempusPool]);
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current?.poolStartDate).toEqual(new Date(1647216000000));

    expect(parseFloat(String(result.current?.maturityTerms[0].apr))).toBeCloseTo(38.29088785046729);
    expect(result.current?.maturityTerms[0].date).toEqual(new Date(Date.UTC(2022, 11, 15)));

    expect(parseFloat(String(result.current?.maturityTerms[1].apr))).toBeCloseTo(29.6893115942029);
    expect(result.current?.maturityTerms[1].date).toEqual(new Date(Date.UTC(2023, 1, 15)));

    expect(result.current?.tokens[0].precision).toBe(18);
    expect(result.current?.tokens[0].ticker).toBe('WETH');
    expect(result.current?.tokens[0].rate).toEqual(new Decimal(1900));

    expect(result.current?.tokens[1].precision).toBe(18);
    expect(result.current?.tokens[1].ticker).toBe('yvWETH');
    expect(result.current?.tokens[1].rate).toEqual(new Decimal(1950));
  });
});
