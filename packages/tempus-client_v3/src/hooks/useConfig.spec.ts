import { renderHook } from '@testing-library/react-hooks';
import { mockConfig } from '../setupTests';
import { useConfig, usePoolList, useTokenList } from './useConfig';

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
        chain: 'ethereum',
      },
      {
        address: '2',
        backingToken: 'USDC',
        chain: 'ethereum',
      },
      {
        address: '3',
        backingToken: 'USDC',
        chain: 'fantom',
      },
      {
        address: '4',
        backingToken: 'ETH',
        chain: 'fantom',
      },
    ]);
  });

  it('returns token list when it is fetched', async () => {
    const { result } = renderHook(() => useTokenList());

    expect(result.current).toEqual([
      {
        address: '1',
        chain: 'ethereum',
      },
      {
        address: '2',
        chain: 'ethereum',
      },
      {
        address: '3',
        chain: 'fantom',
      },
      {
        address: '4',
        chain: 'fantom',
      },
    ]);
  });
});
