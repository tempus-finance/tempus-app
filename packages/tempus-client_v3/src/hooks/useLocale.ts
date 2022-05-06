import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback } from 'react';

const [locale$, setLocale] = createSignal<SupportedLocale>();
const state$ = state(locale$, 'en');

export const SUPPORTED_LOCALES = ['en', 'es', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const SUPPORTED_LOCALE_NAMES: Record<SupportedLocale, string> = {
  // new Intl.DisplayNames(code, { type: 'language' }).of(code)
  en: 'English',
  es: 'Español',
  it: 'Italiano',
};

export function useLocale(): [SupportedLocale, (value: SupportedLocale) => void] {
  const hook = useStateObservable(state$);
  const setLocaleCode = useCallback((value: SupportedLocale) => setLocale(value), []);

  return [hook, setLocaleCode];
}
