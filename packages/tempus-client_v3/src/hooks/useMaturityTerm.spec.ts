import { renderHook } from '@testing-library/react-hooks';
import { delay, of } from 'rxjs';
import { Decimal, getServices, TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1 } from '../setupTests';
import { useMaturityTermHook } from './useMaturityTerm';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockEstimatedDepositAndFix = jest.fn();
const mockEstimatedMintedShares = jest.fn();

describe('useMaturityTerm', () => {
  beforeAll(async () => {
    jest.resetAllMocks();

    const config = getConfigManager();
    await config.init();
  });

  it('returns a maturity term object from the selected pool', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() =>
          of<Decimal>(new Decimal('1500')).pipe(delay(1000)),
        ),
        estimatedMintedShares: mockEstimatedMintedShares.mockImplementation(() =>
          of<Decimal>(new Decimal('200')).pipe(delay(1000)),
        ),
      },
    }));

    const useMaturityTerm = useMaturityTermHook(pool1 as TempusPool);
    const { result, waitForNextUpdate } = renderHook(() => useMaturityTerm());

    expect(result.current).toEqual(null);

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current).toEqual({
      apr: new Decimal('6.5'),
      date: new Date(pool1.maturityDate),
    });
  });
});
