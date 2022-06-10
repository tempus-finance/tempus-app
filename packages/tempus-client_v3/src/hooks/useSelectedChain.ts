import { distinctUntilChanged } from 'rxjs';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { Chain } from 'tempus-core-services';

const [rawSelectedChain$, setSelectedChain] = createSignal<Chain | null>();
export const selectedChain$ = rawSelectedChain$.pipe(distinctUntilChanged());
const stateSelectedChain$ = state(selectedChain$, null);

export function useSelectedChain(): [Chain | null, (chain: Chain | null) => void] {
  const selectedChain = useStateObservable(stateSelectedChain$);

  return [selectedChain, setSelectedChain];
}
