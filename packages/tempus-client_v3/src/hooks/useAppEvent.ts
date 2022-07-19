import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { TempusPool } from 'tempus-core-services';

export type AppEventType = 'deposit' | 'withdraw';

export interface AppEvent {
  eventType: AppEventType;
  tempusPool: TempusPool;
  txnHash: string;
  timestamp: number;
}

const [appEvent$, setAppEvent] = createSignal<AppEvent>();
const stateAppEvent$ = state(appEvent$, null);
export const emitAppEvent = setAppEvent; // to remind to use for better naming only

export function useAppEvent(): [AppEvent | null, (value: AppEvent) => void] {
  const appEvent = useStateObservable(stateAppEvent$);
  return [appEvent, emitAppEvent];
}

export { appEvent$ };
