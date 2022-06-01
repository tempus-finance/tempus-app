import { renderHook } from '@testing-library/react-hooks';
import { useChainList } from './useChainList';

it('returns chain list from config file', async () => {
  const { result } = renderHook(() => useChainList());

  expect(result.current).toStrictEqual(['ethereum', 'fantom', 'ethereum-fork']);
});
