import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback } from 'react';

export const SUPPORTED_LOCALES = ['en', 'es', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const SUPPORTED_LOCALE_NAMES = SUPPORTED_LOCALES.reduce(
  (map, code) => ({
    ...map,
    [code]: new Intl.DisplayNames(code, { type: 'language' }).of(code) || code,
  }),
  {},
) as Record<SupportedLocale, string>;

const [locale$, setLocale] = createSignal<SupportedLocale>();
const state$ = state(locale$, 'en');

export function useLocale(): [SupportedLocale, (value: SupportedLocale) => void] {
  const hook = useStateObservable(state$);
  const setLocaleCode = useCallback((value: SupportedLocale = 'en') => setLocale(value), []);

  return [hook, setLocaleCode];
}
