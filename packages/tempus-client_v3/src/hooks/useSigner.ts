import { JsonRpcSigner } from '@ethersproject/providers';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [signer$, setSigner] = createSignal<JsonRpcSigner | null>();
const stateSigner$ = state(signer$, null);

export const useSigner = (): [JsonRpcSigner | null, (value: JsonRpcSigner | null) => void] => {
  const signer = useStateObservable(stateSigner$);
  return [signer, setSigner];
};

export { signer$ };
