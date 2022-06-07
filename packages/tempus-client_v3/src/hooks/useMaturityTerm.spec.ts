import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import {
  DAYS_IN_A_YEAR,
  Decimal,
  Decimal as MockDecimal,
  ONE,
  SECONDS_IN_A_DAY,
  TempusPool,
} from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1 } from '../setupTests';
import { useMaturityTermHook } from './useMaturityTerm';

jest.mock('./useFixedAprs', () => ({
  ...jest.requireActual('./useFixedAprs'),
  poolAprs$: mockOf({
    // principalsAmount = 1.05
    'ethereum-1': new MockDecimal('0.018964322826463455'),
    'ethereum-2': new MockDecimal('0.027805992889791775'),
    'fantom-3': new MockDecimal('0.017293114339861025'),
    'fantom-4': new MockDecimal('0.08514774494556765'),
    'fantom-5': new MockDecimal('0.066043425814234015'),
  }).pipe(mockDelay(100)),
}));

describe('useMaturityTerm', () => {
  beforeAll(getConfigManager);

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2022, 4, 15));
  });

  it('returns a maturity term object from the selected pool', async () => {
    const principalsAmount = new Decimal('1.05');

    const useMaturityTerm = useMaturityTermHook(pool1 as TempusPool);
    const { result, waitForNextUpdate } = renderHook(() => useMaturityTerm());

    expect(result.current).toEqual(null);

    await waitForNextUpdate({ timeout: 5000 });

    const poolTimeRemaining = (pool1.maturityDate - Date.now()) / 1000;
    const scalingFactor = new Decimal((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolTimeRemaining);

    expect(parseFloat(String(result.current?.apr))).toBeCloseTo(
      parseFloat(principalsAmount.div(pool1.spotPrice).sub(ONE).mul(scalingFactor).toString()),
    );
    expect(result.current?.date).toEqual(new Date(pool1.maturityDate));
  });
});
