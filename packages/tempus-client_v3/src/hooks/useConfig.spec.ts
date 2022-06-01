import { renderHook } from '@testing-library/react-hooks';
import { getConfigManager } from '../config/getConfigManager';
import { mockConfig, pool1, pool2, pool3, pool4 } from '../setupTests';
import { useChainList, useConfig, usePoolList, useTokenList } from './useConfig';

jest.setTimeout(10000);

describe('useConfig', () => {
  beforeAll(async () => {
    jest.resetAllMocks();

    const config = getConfigManager();
    await config.init();
  });

  it('returns config when it is fetched', async () => {
    const { result } = renderHook(() => useConfig());

    expect(mockConfig).toStrictEqual(result.current);
  });

  it('returns pool list when it is fetched', async () => {
    const { result } = renderHook(() => usePoolList());

    expect(result.current).toEqual([pool1, pool2, pool3, pool4]);
  });

  it('returns token list when it is fetched', async () => {
    const { result } = renderHook(() => useTokenList());

    expect(result.current).toStrictEqual([
      {
        address: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
      },
      {
        address: '00001-ybt',
        chain: 'ethereum',
      },
      {
        address: '00001-p',
        chain: 'ethereum',
      },
      {
        address: '00001-y',
        chain: 'ethereum',
      },
      {
        address: '00001-amm',
        chain: 'ethereum',
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
      },
      {
        address: '00002-ybt',
        chain: 'ethereum',
      },
      {
        address: '00002-p',
        chain: 'ethereum',
      },
      {
        address: '00002-y',
        chain: 'ethereum',
      },
      {
        address: '00002-amm',
        chain: 'ethereum',
      },
      {
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
      },
      {
        address: '00003-ybt',
        chain: 'fantom',
      },
      {
        address: '00003-p',
        chain: 'fantom',
      },
      {
        address: '00003-y',
        chain: 'fantom',
      },
      {
        address: '00003-amm',
        chain: 'fantom',
      },
      {
        address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
      },
      {
        address: '00004-ybt',
        chain: 'fantom',
      },
      {
        address: '00004-p',
        chain: 'fantom',
      },
      {
        address: '00004-y',
        chain: 'fantom',
      },
      {
        address: '00004-amm',
        chain: 'fantom',
      },
    ]);
  });

  it('returns chain list when it is fetched', async () => {
    const { result } = renderHook(() => useChainList());

    expect(result.current).toStrictEqual(['ethereum', 'fantom', 'ethereum-fork']);
  });
});
