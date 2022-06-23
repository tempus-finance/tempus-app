import { useCallback } from 'react';
import { distinctUntilChanged } from 'rxjs';
import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { Decimal } from 'tempus-core-services';

export interface UserPreferences {
  slippage: Decimal;
  slippageAuto: boolean;
  darkMode: boolean;
}

export const DEFAULT_SLIPPAGE = 0.01;

const [rawSlippage$, setSlippage] = createSignal<Decimal>();
const [rawSlippageAuto$, setSlippageAuto] = createSignal<boolean>();
const [rawDarkMode$, setDarkmode] = createSignal<boolean>();

const slippage$ = rawSlippage$.pipe(distinctUntilChanged());
const slippageAuto$ = rawSlippageAuto$.pipe(distinctUntilChanged());
const darkMode$ = rawDarkMode$.pipe(distinctUntilChanged());

const stateSlippage$ = state(slippage$, new Decimal(DEFAULT_SLIPPAGE));
const stateSlippageAuto$ = state(slippageAuto$, false);
const stateDarkmode$ = state(darkMode$, false);

export function useUserPreferences(): [UserPreferences, (partial: Partial<UserPreferences>) => void] {
  const slippage = useStateObservable(stateSlippage$);
  const slippageAuto = useStateObservable(stateSlippageAuto$);
  const darkMode = useStateObservable(stateDarkmode$);

  const setPartialPreference = useCallback((partial: Partial<UserPreferences>) => {
    Object.keys(partial).forEach(field => {
      switch (field) {
        case 'slippage':
          if (partial.slippage !== undefined) {
            setSlippage(partial.slippage);
          }
          break;
        case 'slippageAuto':
          if (partial.slippageAuto !== undefined) {
            setSlippageAuto(partial.slippageAuto);
          }
          break;
        case 'darkMode':
        default:
          if (partial.darkMode !== undefined) {
            setDarkmode(partial.darkMode);
          }
          break;
      }
    });
  }, []);

  return [{ slippage, slippageAuto, darkMode }, setPartialPreference];
}
