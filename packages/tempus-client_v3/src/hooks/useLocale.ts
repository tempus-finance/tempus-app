import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

export const SUPPORTED_LOCALES = ['en', 'es', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const SUPPORTED_LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
};

const [locale$, setLocale] = createSignal<SupportedLocale>();
const state$ = state(locale$, 'en');

export function useLocale(): [SupportedLocale, (value: SupportedLocale) => void] {
  const locale = useStateObservable(state$);

  return [locale, setLocale];
}
