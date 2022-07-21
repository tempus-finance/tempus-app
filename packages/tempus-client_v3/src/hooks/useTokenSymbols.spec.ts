import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf, throwError } from 'rxjs';
import { Chain, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { resetTokenSymbols, subscribeTokenSymbols, useTokenSymbols, useTokenSymbol } from './useTokenSymbols';

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns whole token balance map', async () => {
    act(() => {
      resetTokenSymbols();
      subscribeTokenSymbols();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSymbols());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-amm': 'm',
      'ethereum-00001-p': 'm',
      'ethereum-00001-y': 'm',
      'ethereum-00001-ybt': 'stETH',
      'ethereum-00002-amm': 'm',
      'ethereum-00002-p': 'm',
      'ethereum-00002-y': 'm',
      'ethereum-00002-ybt': 'yvUSDC',
      'ethereum-0x0000000000000000000000000000000000000000': 'ETH',
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      'fantom-00003-amm': 'm',
      'fantom-00003-p': 'm',
      'fantom-00003-y': 'm',
      'fantom-00003-ybt': 'yvUSDC',
      'fantom-00004-amm': 'm',
      'fantom-00004-p': 'm',
      'fantom-00004-y': 'm',
      'fantom-00004-ybt': 'yvWETH',
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': 'WETH',
    });
  });

  [
    { chain: 'ethereum', tokenAddress: '00001-amm', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00001-p', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00001-y', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00001-ybt', expected: 'stETH' },
    { chain: 'ethereum', tokenAddress: '00002-amm', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00002-p', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00002-y', expected: 'm' },
    { chain: 'ethereum', tokenAddress: '00002-ybt', expected: 'yvUSDC' },
    { chain: 'ethereum', tokenAddress: '0x0000000000000000000000000000000000000000', expected: 'ETH' },
    { chain: 'ethereum', tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', expected: 'USDC' },
    { chain: 'fantom', tokenAddress: '00003-amm', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00003-p', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00003-y', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00003-ybt', expected: 'yvUSDC' },
    { chain: 'fantom', tokenAddress: '00004-amm', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00004-p', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00004-y', expected: 'm' },
    { chain: 'fantom', tokenAddress: '00004-ybt', expected: 'yvWETH' },
    { chain: 'fantom', tokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75', expected: 'USDC' },
    { chain: 'fantom', tokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d', expected: 'WETH' },
  ].forEach(({ chain, tokenAddress, expected }) => {
    test(`returns token symbol for ${tokenAddress} on ${chain}`, async () => {
      act(() => {
        resetTokenSymbols();
        subscribeTokenSymbols();
      });

      const { result, waitForNextUpdate } = renderHook(() => useTokenSymbol(chain as Chain, tokenAddress));

      expect(result.current).toBeNull();

      await waitForNextUpdate();

      expect(result.current).toEqual(expected);
    });
  });

  test('return backing token and ybt only when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetTokenSymbols();
      subscribeTokenSymbols();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSymbols());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-ybt': 'stETH',
      'ethereum-00002-ybt': 'yvUSDC',
      'ethereum-0x0000000000000000000000000000000000000000': 'ETH',
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      'fantom-00003-ybt': 'yvUSDC',
      'fantom-00004-ybt': 'yvWETH',
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': 'WETH',
    });

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return backing token and ybt only when there is error when ERC20TokenServiceGetter()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => {
        throw new Error();
      }),
    });

    act(() => {
      resetTokenSymbols();
      subscribeTokenSymbols();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSymbols());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-ybt': 'stETH',
      'ethereum-00002-ybt': 'yvUSDC',
      'ethereum-0x0000000000000000000000000000000000000000': 'ETH',
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      'fantom-00003-ybt': 'yvUSDC',
      'fantom-00004-ybt': 'yvWETH',
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': 'WETH',
    });

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return backing token and ybt only when there is error when ERC20TokenServiceGetter.symbol()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        symbol: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      })),
    });

    act(() => {
      resetTokenSymbols();
      subscribeTokenSymbols();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSymbols());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-ybt': 'stETH',
      'ethereum-00002-ybt': 'yvUSDC',
      'ethereum-0x0000000000000000000000000000000000000000': 'ETH',
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      'fantom-00003-ybt': 'yvUSDC',
      'fantom-00004-ybt': 'yvWETH',
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': 'WETH',
    });

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return backing token and ybt only when there is Observable<Error> when ERC20TokenServiceGetter.symbol()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        symbol: jest.fn().mockReturnValue(throwError(() => new Error())),
      })),
    });

    act(() => {
      resetTokenSymbols();
      subscribeTokenSymbols();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSymbols());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-ybt': 'stETH',
      'ethereum-00002-ybt': 'yvUSDC',
      'ethereum-0x0000000000000000000000000000000000000000': 'ETH',
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      'fantom-00003-ybt': 'yvUSDC',
      'fantom-00004-ybt': 'yvWETH',
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': 'WETH',
    });

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
