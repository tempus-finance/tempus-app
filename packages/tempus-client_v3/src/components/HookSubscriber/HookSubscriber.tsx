import { FC } from 'react';
import {
  useLocale,
  useSelectedChain,
  useUserPreferences,
  useServicesLoaded,
  useWalletAddress,
  usePoolViewOptions,
  useSigner,
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

  // TODO: may consider to call stream$.subscribe() here instead of app start

  return null;
};
