import { renderHook } from '@testing-library/react-hooks';
import { Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useTokenRates } from './useTokenRates';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

describe('useTokenRates', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

  test('returns all tokens used by all pools', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current['ethereum-0x0000000000000000000000000000000000000000']).toEqual(new Decimal(2999));
    expect(result.current['ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']).toEqual(new Decimal(0.999));
    expect(result.current['fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d']).toEqual(new Decimal(3001));
    expect(result.current['fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75']).toEqual(new Decimal(1.001));
  });

  test('returns empty map when service throw error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

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
