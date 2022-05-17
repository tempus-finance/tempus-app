import { act, renderHook } from '@testing-library/react-hooks';
import { delay, of } from 'rxjs';
import { Decimal, getServices, TempusPool } from 'tempus-core-services';
import { useFixedApr } from './useFixedApr';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockEstimatedDepositAndFix = jest.fn();
const mockEstimatedMintedShares = jest.fn();

describe('useFixedApr', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('returns `0` as initial value', async () => {
    const [useApr] = useFixedApr({ address: 'abc', spotPrice: '3' } as TempusPool);
    const { result } = renderHook(() => useApr());

    expect(mockEstimatedDepositAndFix).not.toHaveBeenCalled();
    expect(mockEstimatedMintedShares).not.toHaveBeenCalled();
    expect(result.current).toEqual(new Decimal('0'));
  });

  it('returns a value based on spot price if token amount is not set', async () => {
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

    const [useApr] = useFixedApr({ address: 'abc', spotPrice: '3' } as TempusPool);
    const { waitForNextUpdate, result } = renderHook(() => useApr());

    expect(result.current).toEqual(new Decimal('0'));

    await waitForNextUpdate({ timeout: 5000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(1);
    expect(mockEstimatedMintedShares).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(new Decimal('6.5'));
  });

  it('returns a value when pool and token amount are set', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() =>
          of<Decimal>(new Decimal('1000')).pipe(delay(1000)),
        ),
        estimatedMintedShares: mockEstimatedMintedShares.mockImplementation(() =>
          of<Decimal>(new Decimal('100')).pipe(delay(1000)),
        ),
      },
    }));

    const [useApr, setTokenAmount] = useFixedApr({ address: 'xyz', spotPrice: '5' } as TempusPool);
    const { waitForNextUpdate, result } = renderHook(() => useApr());

    expect(result.current).toEqual(new Decimal('0'));

    act(() => {
      setTokenAmount(new Decimal('120'));
    });
    await waitForNextUpdate({ timeout: 5000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(1);
    expect(mockEstimatedMintedShares).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(new Decimal('9'));
  });
});
