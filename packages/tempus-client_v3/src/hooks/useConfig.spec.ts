import { renderHook } from '@testing-library/react-hooks';
import { mockConfig } from '../setupTests';
import { useChainList, useConfig, usePoolList, useTokenList } from './useConfig';

describe.only('useConfig', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('returns config when it is fetched', async () => {
    const { result } = renderHook(() => useConfig());

    expect(result.current).toEqual(mockConfig);
  });

  it('returns pool list when it is fetched', async () => {
    const { result } = renderHook(() => usePoolList());

    expect(result.current).toEqual([
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        tokenPrecision: {
          backingToken: 18,
          yieldBearingToken: 18,
        },
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        tokenPrecision: {
          backingToken: 6,
          yieldBearingToken: 6,
        },
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        tokenPrecision: {
          backingToken: 6,
          yieldBearingToken: 6,
        },
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        tokenPrecision: {
          backingToken: 18,
          yieldBearingToken: 18,
        },
      },
    ]);
  });

  it('returns token list when it is fetched', async () => {
    const { result } = renderHook(() => useTokenList());

    expect(result.current).toEqual([
      {
        address: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
      },
      {
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
      },
      {
        address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
      },
    ]);
  });

  it('returns chain list when it is fetched', async () => {
    const { result } = renderHook(() => useChainList());

    expect(result.current).toEqual(['fantom', 'ethereum']);
  });
});
