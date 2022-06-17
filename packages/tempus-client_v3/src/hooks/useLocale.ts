import { distinctUntilChanged } from 'rxjs';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback } from 'react';
import i18n, { SupportedLocale } from '../i18n';

const [rawLocale$, setLocale] = createSignal<SupportedLocale>();
const locale$ = rawLocale$.pipe(distinctUntilChanged());
const state$ = state(locale$, i18n.languages[0] as SupportedLocale);

export function useLocale(): [SupportedLocale, (value: SupportedLocale) => void] {
  const locale = useStateObservable(state$);

  const setActualLocale = useCallback(code => {
    setLocale(code);
    i18n.changeLanguage(code);
  }, []);

  return [locale, setActualLocale];
}
