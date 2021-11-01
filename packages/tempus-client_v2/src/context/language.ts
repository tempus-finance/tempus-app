import React, { Dispatch, SetStateAction } from 'react';
import { Language } from '../localisation/getText';

interface ContextData {
  language: Language;
}

interface ContextActions {
  setLanguage: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultLanguageContextValue: ContextData = {
  language: 'en',
};

export const LanguageContext = React.createContext<ContextType>({
  ...defaultLanguageContextValue,
  setLanguage: null,
});
