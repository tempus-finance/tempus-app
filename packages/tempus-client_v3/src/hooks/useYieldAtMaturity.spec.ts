import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { of as mockOf, of, throwError } from 'rxjs';
import { Decimal, Decimal as MockDecimal, getDefinedServices, ONE, TempusPool, ZERO } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useYieldAtMaturity, setPoolForYieldAtMaturity, setTokenAmountForYieldAtMaturity } from './useYieldAtMaturity';
import { pool1 } from '../mocks/config/mockConfig';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn().mockImplementation(() => ({
    StatisticsService: {
      estimatedDepositAndFix: () => mockOf(new MockDecimal(1234)),
    },
  })),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('useYieldAtMaturity', () => {
  beforeAll(getConfigManager);

  test('returns ZERO if token amount is set to ZERO', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    try {
      await act(async () => {
        setPoolForYieldAtMaturity(pool1 as TempusPool);
        setTokenAmountForYieldAtMaturity(ZERO);
        await waitForNextUpdate();

        // should throw error and cannot reach this line
        expect(true).toBeFalsy();
      });
    } catch (error) {
      // wont get update becoz same value ZERO output from hook
    }

    // error becoz of timeout so not calling console.error
    expect(console.error).not.toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('returns yield if token amount is >ZERO', async () => {
    const amount = new Decimal(1234);
    const mockEstimatedDepositAndFix = jest.fn();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(
          (_tempusPool: TempusPool, tokenAmount: Decimal, _isBackingToken: boolean) => {
            return of(tokenAmount.add(amount));
          },
        ),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    await act(async () => {
      setPoolForYieldAtMaturity(pool1 as TempusPool);
      setTokenAmountForYieldAtMaturity(ONE);
      await waitForNextUpdate();
    });

    expect(result.current).toEqual(amount);
    expect(mockEstimatedDepositAndFix).toHaveBeenCalledWith(pool1, ONE, true);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue(null);

    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    try {
      await act(async () => {
        setPoolForYieldAtMaturity(pool1 as TempusPool);
        setTokenAmountForYieldAtMaturity(ONE);
        await waitForNextUpdate();
      });
    } catch (e) {
      // when error, return default value and call console.error
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    try {
      await act(async () => {
        setPoolForYieldAtMaturity(pool1 as TempusPool);
        setTokenAmountForYieldAtMaturity(ONE);
        await waitForNextUpdate();
      });
    } catch (e) {
      // when error, return default value and call console.error
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when StatisticsService.estimatedDepositAndFix()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    try {
      await act(async () => {
        setPoolForYieldAtMaturity(pool1 as TempusPool);
        setTokenAmountForYieldAtMaturity(ONE);
        await waitForNextUpdate();
      });
      console.log('after 1');
    } catch (e) {
      // when error, return default value and call console.error
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is Observable<Error> when StatisticsService.estimatedDepositAndFix()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(throwError(() => new Error())),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useYieldAtMaturity());

    expect(result.current).toEqual(ZERO);

    try {
      await act(async () => {
        setPoolForYieldAtMaturity(pool1 as TempusPool);
        setTokenAmountForYieldAtMaturity(ONE);
        await waitForNextUpdate();
      });
    } catch (e) {
      // when error, return default value and call console.error
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
