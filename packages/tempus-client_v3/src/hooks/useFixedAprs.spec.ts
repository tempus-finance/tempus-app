import { renderHook } from '@testing-library/react-hooks';
import { of } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useFixedAprs } from './useFixedAprs';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockEstimatedDepositAndFix = jest.fn();
const mockEstimatedMintedShares = jest.fn();

describe('useFixedAprs', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();

    jest.resetAllMocks();
  });

  it('returns `{}` as initial value', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of<Decimal>(new Decimal('1500'))),
        estimatedMintedShares: mockEstimatedMintedShares.mockImplementation(() => of<Decimal>(new Decimal('200'))),
      },
    }));

    const { result } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});
  });

  it('returns pool-to-APR map based on spot price', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of<Decimal>(new Decimal('1500'))),
        estimatedMintedShares: mockEstimatedMintedShares.mockImplementation(() => of<Decimal>(new Decimal('200'))),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    await waitForNextUpdate();

    const expectedResult = {
      'ethereum-1': new Decimal(6.5),
      'ethereum-2': new Decimal(6.5),
      'fantom-3': new Decimal(6.5),
      'fantom-4': new Decimal(6.5),
    };
    expect(result.current).toEqual(expectedResult);
  });

  test('returns `{}` when there is an error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender because it's same as initial value
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
