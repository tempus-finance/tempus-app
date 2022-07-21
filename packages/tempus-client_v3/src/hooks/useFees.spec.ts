import { act, renderHook } from '@testing-library/react-hooks';
import { delay as mockDelay, of as mockOf, of } from 'rxjs';
import { Decimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import {
  pool1,
  pool2,
  pool3,
  pool4,
  pool5,
  pool1 as mockPool1,
  pool2 as mockPool2,
  pool3 as mockPool3,
  pool4 as mockPool4,
  pool5 as mockPool5,
} from '../setupTests';
import { Fees, resetFeesData, subscribeFeesData, useFees } from './useFees';

const mockPoolFees: Fees = {
  deposit: new Decimal(0.01),
  redemption: new Decimal(0.02),
  earlyRedemption: new Decimal(0.03),
};
const mockSwapFee = new Decimal(0.04);

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

jest.mock('./usePoolList', () => ({
  ...jest.requireActual('./usePoolList'),
  poolList$: mockOf([mockPool1, mockPool2, mockPool3, mockPool4, mockPool5]),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('useFees', () => {
  beforeAll(() => {
    const configManager = getConfigManager();
    configManager.init();
  });

  test('returns a fees map of all pools', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusPoolService: {
        getFeesConfig: jest
          .fn()
          .mockImplementation(() =>
            of([mockPoolFees.deposit, mockPoolFees.earlyRedemption, mockPoolFees.redemption] as Decimal[]).pipe(
              mockDelay(500),
            ),
          ),
      },
      TempusAMMService: {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFee.toBigNumber()),
      },
    }));

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFees());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    const expected = [pool1, pool2, pool3, pool4, pool5].reduce(
      (feeMap, pool) => ({
        ...feeMap,
        [`${pool.chain}-${pool.address}`]: {
          ...mockPoolFees,
          swap: mockSwapFee,
        },
      }),
      {},
    );
    expect(result.current).toEqual(expected);
  });

  xtest('directly get the latest value for 2nd hooks', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusPoolService: {
        getFeesConfig: jest
          .fn()
          .mockImplementation(() =>
            of([mockPoolFees.deposit, mockPoolFees.earlyRedemption, mockPoolFees.redemption] as Decimal[]).pipe(
              mockDelay(500),
            ),
          ),
      },
      TempusAMMService: {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFee.toBigNumber()),
      },
    }));

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useFees());

    expect(result1.current).toEqual({});

    await waitForNextUpdate();

    const expected = [pool1, pool2, pool3, pool4, pool5].reduce(
      (feeMap, pool) => ({
        ...feeMap,
        [`${pool.chain}-${pool.address}`]: {
          ...mockPoolFees,
          swap: mockSwapFee,
        },
      }),
      {},
    );
    expect(result1.current).toEqual(expected);
    const functionCalledCount = (getDefinedServices as unknown as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useFees());

    expect(result2.current).toEqual(expected);
    expect(getDefinedServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => null);

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFees());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFees());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when TempusPoolService.getFeesConfig()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusPoolService: {
        getFeesConfig: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
      TempusAMMService: {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFee.toBigNumber()),
      },
    }));

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFees());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when TempusAMMService.getSwapFeePercentage()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusPoolService: {
        getFeesConfig: jest
          .fn()
          .mockImplementation(() =>
            of([mockPoolFees.deposit, mockPoolFees.redemption, mockPoolFees.earlyRedemption] as Decimal[]).pipe(
              mockDelay(500),
            ),
          ),
      },
      TempusAMMService: {
        getSwapFeePercentage: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    act(() => {
      resetFeesData();
      subscribeFeesData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFees());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
