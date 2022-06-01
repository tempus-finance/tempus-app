import { renderHook } from '@testing-library/react-hooks';
import { pool1, pool2, pool3, pool4, pool5 } from '../setupTests';
import { usePoolList } from './usePoolList';

it('returns pool list from config file', async () => {
  const { result } = renderHook(() => usePoolList());

  expect(result.current).toEqual([pool1, pool2, pool3, pool4, pool5]);
});
