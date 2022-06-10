import { distinctUntilChanged } from 'rxjs';
import { JsonRpcSigner } from '@ethersproject/providers';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [rawSigner$, setSigner] = createSignal<JsonRpcSigner | null>();
const signer$ = rawSigner$.pipe(distinctUntilChanged());
const stateSigner$ = state(signer$, null);

export const useSigner = (): [JsonRpcSigner | null, (value: JsonRpcSigner | null) => void] => {
  const signer = useStateObservable(stateSigner$);
  return [signer, setSigner];
};

export { signer$ };
