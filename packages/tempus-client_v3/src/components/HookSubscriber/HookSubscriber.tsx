import { FC, useEffect } from 'react';
import {
  useLocale,
  useSelectedChain,
  useUserPreferences,
  useServicesLoaded,
  useWalletAddress,
  usePoolViewOptions,
  useSigner,
  subscribeFixedAprs,
  subscribeTakenRates,
  subscribeTvlData,
  subscribeAllowance,
  subscribeApproveTokenStatus,
  subscribeFixedDepositStatus,
} from '../../hooks';

export const HookSubscriber: FC = () => {
  // to keep at least one subscriber of the stream insides the state hooks
  useLocale();
  useUserPreferences();
  useSelectedChain();
  usePoolViewOptions();
  useServicesLoaded();
  useWalletAddress();
  useSigner();

  // subscribe for the steam$ of the polling hooks
  useEffect(() => {
    subscribeTvlData();
    subscribeTakenRates();
    subscribeFixedAprs();
    subscribeAllowance();
    subscribeApproveTokenStatus();
    subscribeFixedDepositStatus();
  }, []);

  return null;
};
