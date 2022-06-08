import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useSigner } from './useSigner';

describe('useSigner', () => {
  it('sets default value to null', () => {
    const { result } = renderHook(() => useSigner());

    const [signer] = result.current;

    expect(signer).toBe(null);
  });

  it('sets signer in the state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSigner());

    const [signer, setSigner] = result.current;

    expect(signer).toBe(null);

    await act(async () => {
      setSigner({ propA: 'abc' } as unknown as JsonRpcSigner);
      await waitForNextUpdate();
    });

    const [signerAfterUpdate] = result.current;

    expect(signerAfterUpdate).toStrictEqual({ propA: 'abc' });
  });
});
