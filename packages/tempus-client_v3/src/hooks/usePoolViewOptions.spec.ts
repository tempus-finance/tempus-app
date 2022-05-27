import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { getConfigManager } from '../config/getConfigManager';
import { FilterType } from '../interfaces';
import { pool1, pool2, pool3, pool4 } from '../setupTests';
import { usePoolViewOptions, useFilteredSortedPoolList } from './usePoolViewOptions';

describe('usePoolViewOptions', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

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
    const expectedFilteredSortedPoolListResult = [pool1, pool2, pool3, pool4];

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
    const expectedFilteredSortedPoolListResult = [pool1, pool2, pool3, pool4];

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
    const expectedFilteredSortedPoolListResult = [pool1, pool2, pool3, pool4];

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
    const expectedFilteredSortedPoolListResult1 = [pool1, pool2, pool3, pool4];

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
    const expectedFilteredSortedPoolListResult2 = [pool4, pool2, pool3, pool1];

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
