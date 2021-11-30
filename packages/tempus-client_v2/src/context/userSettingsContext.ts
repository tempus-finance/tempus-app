import React, { Dispatch, SetStateAction } from 'react';

interface UserSettingsContextData {
  showFiat: boolean;
  slippage: number; // value from 0 to 100
}

interface UserSettingsContextActions {
  setUserSettings: Dispatch<SetStateAction<UserSettingsContextData>> | null;
}

interface UserSettingsContextType extends UserSettingsContextActions, UserSettingsContextData {}

export const defaultUserSettingsContextValue: UserSettingsContextData = {
  showFiat: false,
  slippage: 1, // 1%
};

export const UserSettingsContext = React.createContext<UserSettingsContextType>({
  ...defaultUserSettingsContextValue,
  setUserSettings: null,
});
