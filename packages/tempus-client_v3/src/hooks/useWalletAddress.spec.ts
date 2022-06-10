import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useWalletAddress } from './useWalletAddress';

describe('useWalletAddress', () => {
  it('sets default value to empty string', () => {
    const { result } = renderHook(() => useWalletAddress());

    const [walletAddress] = result.current;

    expect(walletAddress).toEqual('');
  });

  it('sets wallet address in the state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWalletAddress());

    const [walletAddress, setWalletAddress] = result.current;

    expect(walletAddress).toEqual('');

    await act(async () => {
      setWalletAddress('0x01');
      await waitForNextUpdate();
    });

    const [walletAddressAfterUpdate] = result.current;

    expect(walletAddressAfterUpdate).toEqual('0x01');
  });
});
