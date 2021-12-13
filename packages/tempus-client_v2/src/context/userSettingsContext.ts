import React, { Dispatch, SetStateAction } from 'react';

interface UserSettingsContextData {
  showFiat: boolean;
  slippage: number; // value from 0 to 100
  autoSlippage: boolean;
  openWalletPopup: boolean;
  openWalletSelector: boolean;
  isWalletSelectorIrremovable: boolean;
}

interface UserSettingsContextActions {
  setUserSettings: Dispatch<SetStateAction<UserSettingsContextData>> | null;
}

interface UserSettingsContextType extends UserSettingsContextActions, UserSettingsContextData {}

export const defaultUserSettingsContextValue: UserSettingsContextData = {
  showFiat: true,
  slippage: 1, // 1%
  autoSlippage: false,
  openWalletPopup: false,
  openWalletSelector: false,
  isWalletSelectorIrremovable: false,
};

export const UserSettingsContext = React.createContext<UserSettingsContextType>({
  ...defaultUserSettingsContextValue,
  setUserSettings: null,
});
