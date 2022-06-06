import { act, renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useTvlData, useTotalTvl, subscribe, reset } from './useTvlData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns a total TVL of all pools', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTotalTvl());

    expect(result.current.toString()).toEqual('0');

    await waitForNextUpdate();
    expect(result.current.toString()).toEqual('31000');
  });

  test('returns a TVL map of all pools', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    };
    expect(result.current).toEqual(expected);
  });

  test('directly get the latest value for 2nd hooks', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result1.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    };
    expect(result1.current).toEqual(expected);
    const functionCalledCount = (getServices as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useTvlData());

    expect(result2.current).toEqual(expected);
    expect(getServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  test('returns a empty map when there is error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender becoz it's same as initial value
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
