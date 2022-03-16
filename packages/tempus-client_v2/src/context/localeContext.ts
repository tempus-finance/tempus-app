import React, { Dispatch, SetStateAction } from 'react';
import { Locale } from '../interfaces/Locale';
import SupportedLocales from '../localisation/SupportedLocales';

interface LocaleContextData {
  locale: Locale;
}

interface LocaleContextActions {
  setLocale: Dispatch<SetStateAction<LocaleContextData>> | null;
}

interface LocaleContextType extends LocaleContextActions, LocaleContextData {}

export const defaultLocaleContextValue: LocaleContextData = {
  locale: SupportedLocales.EN,
};

export const LocaleContext = React.createContext<LocaleContextType>({
  ...defaultLocaleContextValue,
  setLocale: null,
});
