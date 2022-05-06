import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback } from 'react';
import { Decimal } from 'tempus-core-services';

export type UserPreferences = {
  slippage: Decimal;
  slippageAuto: boolean;
  darkmode: boolean;
};

const [slippage$, setSlippage] = createSignal<Decimal>();
const [slippageAuto$, setSlippageAuto] = createSignal<boolean>();
const [darkmode$, setDarkmode] = createSignal<boolean>();

const stateSlippage$ = state(slippage$, new Decimal(0.02));
const stateSlippageAuto$ = state(slippageAuto$, false);
const stateDarkmode$ = state(darkmode$, false);

export function useUserPreferences(): [UserPreferences, (partial: Partial<UserPreferences>) => void] {
  const slippage = useStateObservable(stateSlippage$);
  const slippageAuto = useStateObservable(stateSlippageAuto$);
  const darkmode = useStateObservable(stateDarkmode$);

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
        case 'darkmode':
        default:
          if (partial.darkmode !== undefined) {
            setDarkmode(partial.darkmode);
          }
          break;
      }
    });
  }, []);

  return [{ slippage, slippageAuto, darkmode }, setPartialPreference];
}
