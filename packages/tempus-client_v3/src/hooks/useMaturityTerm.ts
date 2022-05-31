import { bind } from '@react-rxjs/core';
import { map, Observable } from 'rxjs';
import { Decimal, TempusPool } from 'tempus-core-services';
import { MaturityTerm } from '../interfaces';
import { poolAprs$ } from './useFixedAprs';

export const maturityTerm$ = (sourceTempusPool: TempusPool): Observable<MaturityTerm> =>
  poolAprs$.pipe(
    map(aprsMap => aprsMap[`${sourceTempusPool.chain}-${sourceTempusPool.address}`]),
    map((apr: Decimal) => ({
      apr,
      date: new Date(sourceTempusPool.maturityDate),
    })),
  );

export const useMaturityTermHook = (tempusPool: TempusPool): (() => MaturityTerm | null) => {
  const [useMaturityTerm] = bind(maturityTerm$(tempusPool), null);

  return useMaturityTerm;
};
