import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { FilterType } from '../interfaces';
import { usePoolViewOptions, useFilteredSortedPoolList } from './usePoolViewOptions';

describe('usePoolViewOptions', () => {
  it('check default value', () => {
    const { result: poolViewResult } = renderHook(() => usePoolViewOptions());
    const { result: filteredSortedPoolListResult } = renderHook(() => useFilteredSortedPoolList());
    const [poolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };
    const expectedFilteredSortedPoolListResult = [
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ];

    expect(poolViewOptions).toEqual(expectedPoolViewOptions);
    expect(filteredSortedPoolListResult.current).toEqual(expectedFilteredSortedPoolListResult);
  });

  it('update viewType to "list"', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);

    await act(async () => {
      setPoolViewOptions({ viewType: 'list' });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'list',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
  });

  it('update poolType to "fixed"', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);

    await act(async () => {
      setPoolViewOptions({ poolType: 'fixed' });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'fixed',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
  });

  it('update filters to set of ["inactive"]', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const { result: filteredSortedPoolListResult } = renderHook(() => useFilteredSortedPoolList());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };
    const expectedFilteredSortedPoolListResult = [
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ];

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);
    expect(filteredSortedPoolListResult.current).toEqual(expectedFilteredSortedPoolListResult);

    await act(async () => {
      setPoolViewOptions({ filters: new Set(['inactive']) });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(['inactive']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
    expect(filteredSortedPoolListResult.current).toEqual([]);
  });

  it('update filters to set of ["matured"]', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const { result: filteredSortedPoolListResult } = renderHook(() => useFilteredSortedPoolList());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };
    const expectedFilteredSortedPoolListResult = [
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ];

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);
    expect(filteredSortedPoolListResult.current).toEqual(expectedFilteredSortedPoolListResult);

    await act(async () => {
      setPoolViewOptions({ filters: new Set(['matured']) });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(['matured']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
    expect(filteredSortedPoolListResult.current).toEqual([]);
  });

  it('update sortType to "apr"', async () => {
    // TODO: check the useFilteredSortedPoolList()
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);

    await act(async () => {
      setPoolViewOptions({ sortType: 'apr' });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'apr',
      sortOrder: 'asc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
  });

  it('update sortOrder to "desc"', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const { result: filteredSortedPoolListResult } = renderHook(() => useFilteredSortedPoolList());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };
    const expectedFilteredSortedPoolListResult1 = [
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ];

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);
    expect(filteredSortedPoolListResult.current).toEqual(expectedFilteredSortedPoolListResult1);

    await act(async () => {
      setPoolViewOptions({ sortOrder: 'desc' });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'desc',
    };
    const expectedFilteredSortedPoolListResult2 = [
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ];

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
    expect(filteredSortedPoolListResult.current).toEqual(expectedFilteredSortedPoolListResult2);
  });

  it('update multiple pool view options at once', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expectedPoolViewOptions1);

    await act(async () => {
      setPoolViewOptions({ sortType: 'apr', sortOrder: 'desc' });
      await waitForNextUpdate();
    });

    const expectedPoolViewOptions2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'apr',
      sortOrder: 'desc',
    };

    expect(poolViewResult.current[0]).toEqual(expectedPoolViewOptions2);
  });

  it('update pool view options with undefined', async () => {
    const { result: poolViewResult, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = poolViewResult.current;
    const expectedPoolViewOptions = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set<FilterType>(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expectedPoolViewOptions);

    await act(async () => {
      setPoolViewOptions({
        viewType: undefined,
        poolType: undefined,
        filters: undefined,
        sortType: undefined,
        sortOrder: undefined,
      });

      // timeout becoz no update will occur
      try {
        await waitForNextUpdate();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
