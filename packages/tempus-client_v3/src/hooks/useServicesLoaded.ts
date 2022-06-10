import { distinctUntilChanged } from 'rxjs';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [rawServicesLoaded$, setServicesLoaded] = createSignal<boolean>();
const servicesLoaded$ = rawServicesLoaded$.pipe(distinctUntilChanged());
const stateServicesLoaded$ = state(servicesLoaded$, false);

export function useServicesLoaded(): [boolean, (value: boolean) => void] {
  const servicesLoaded = useStateObservable(stateServicesLoaded$);
  return [servicesLoaded, setServicesLoaded];
}

export { servicesLoaded$ };
