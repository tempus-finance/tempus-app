import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [servicesLoaded$, setServicesLoaded] = createSignal<boolean>();
const stateServicesLoaded$ = state(servicesLoaded$, false);

export function useServicesLoaded(): [boolean, (value: boolean) => void] {
  const servicesLoaded = useStateObservable(stateServicesLoaded$);
  return [servicesLoaded, setServicesLoaded];
}

export { servicesLoaded$ };
