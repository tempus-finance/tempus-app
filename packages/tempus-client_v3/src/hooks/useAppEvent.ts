import { map, Observable } from 'rxjs';
import { TempusPool } from 'tempus-core-services';
import { poolList$ } from './usePoolList';

// TODO: we dont have this event$ yet. this is a dummy event$ that gives tempusPool as param
export const appEvent$: Observable<{ tempusPool: TempusPool }> = poolList$.pipe(
  map(tempusPools => ({ tempusPool: tempusPools[0] })),
);

// TODO: we should have a hook for consumer to emit app event like deposit/withdraw
