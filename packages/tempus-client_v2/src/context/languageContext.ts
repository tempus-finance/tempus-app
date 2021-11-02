import React, { Dispatch, SetStateAction } from 'react';
import { Language } from '../localisation/getText';

interface LanguageContextData {
  language: Language;
}

interface LanguageContextActions {
  setLanguage: Dispatch<SetStateAction<LanguageContextData>> | null;
}

interface LanguageContextType extends LanguageContextActions, LanguageContextData {}

export const defaultLanguageContextValue: LanguageContextData = {
  language: 'en',
};

export const LanguageContext = React.createContext<LanguageContextType>({
  ...defaultLanguageContextValue,
  setLanguage: null,
});
