import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Chain } from 'tempus-core-services';
import { useSelectedChain } from './useSelectedChain';

describe('useSelectedChain', () => {
  it('sets default value to null', () => {
    const { result } = renderHook(() => useSelectedChain());

    const [selectedChain] = result.current;

    expect(selectedChain).toEqual(null);
  });

  it('properly sets new chain', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSelectedChain());

    const [selectedChain, setSelectedChain] = result.current;

    const chainName: Chain = 'ethereum';

    // Default value
    expect(selectedChain).toEqual(null);

    await act(async () => {
      setSelectedChain(chainName);
      await waitForNextUpdate();
    });

    const [selectedChainAfterUpdate] = result.current;

    expect(selectedChainAfterUpdate).toEqual(chainName);
  });
});
