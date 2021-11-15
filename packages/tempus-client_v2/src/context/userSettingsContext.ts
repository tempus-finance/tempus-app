import React, { Dispatch, SetStateAction } from 'react';

interface UserSettingsContextData {
  showFiat: boolean;
}

interface UserSettingsContextActions {
  setShowFiat: Dispatch<SetStateAction<UserSettingsContextData>> | null;
}

interface UserSettingsContextType extends UserSettingsContextActions, UserSettingsContextData {}

export const defaultUserSettingsContextValue: UserSettingsContextData = {
  showFiat: false,
};

export const UserSettingsContext = React.createContext<UserSettingsContextType>({
  ...defaultUserSettingsContextValue,
  setShowFiat: null,
});
