import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { usePoolViewOptions } from './usePoolViewOptions';

describe('usePoolViewOptions', () => {
  it('check default value', () => {
    const { result } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions] = result.current;
    const expected = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected);
  });

  it('update viewType to "list"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ viewType: 'list' });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'list',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update poolType to "fixed"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ poolType: 'fixed' });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'grid',
      poolType: 'fixed',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update filters to set of ["active"]', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ filters: new Set(['active']) });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(['active']),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update sortType to "apr"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ sortType: 'apr' });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'apr',
      sortOrder: 'asc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update sortOrder to "desc"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ sortOrder: 'desc' });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'desc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update multiple pool view options at once', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected1 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected1);

    await act(async () => {
      setPoolViewOptions({ sortType: 'apr', sortOrder: 'desc' });
      await waitForNextUpdate();
    });

    const expected2 = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'apr',
      sortOrder: 'desc',
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update pool view options with undefined', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolViewOptions());
    const [poolViewOptions, setPoolViewOptions] = result.current;
    const expected = {
      viewType: 'grid',
      poolType: 'all',
      filters: new Set(),
      sortType: 'a-z',
      sortOrder: 'asc',
    };

    expect(poolViewOptions).toEqual(expected);

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
