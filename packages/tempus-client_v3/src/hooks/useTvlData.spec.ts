import { renderHook } from '@testing-library/react-hooks';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useTvlData, useTotalTvl } from './useTvlData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

describe('useTvlData', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

  test('returns a total TVL of all pools', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTotalTvl());

    expect(result.current.toString()).toEqual('0');

    await waitForNextUpdate();
    expect(result.current.toString()).toEqual('31000');
  });

  test('returns a TVL map of all pools', async () => {
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

  test('returns a empty map when there is error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
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
