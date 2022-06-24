import { JsonRpcSigner } from '@ethersproject/providers';
import { BehaviorSubject, combineLatest, filter, merge, mergeMap, Observable, of } from 'rxjs';
import { getDefinedServices } from 'tempus-core-services';
import { servicesLoaded$ } from './useServicesLoaded';
import { tokenList$ } from './useTokenList';
import { signer$ } from './useSigner';
import { walletAddress$ } from './useWalletAddress';
import { TokenListItem } from '../config/ConfigManager';

export interface TrasnferTransaction {
  fromAddress: string;
  toAddress: string;
  walletAddress: string;
  token: TokenListItem;
}

export const transferStream$ = combineLatest([tokenList$, walletAddress$, signer$, servicesLoaded$]).pipe(
  filter(
    ([tokenListItems, walletAddress, signer, servicesLoaded]) =>
      tokenListItems.length > 0 && Boolean(walletAddress) && Boolean(signer) && servicesLoaded,
  ),
  mergeMap<[TokenListItem[], string, JsonRpcSigner | null, boolean], Observable<TrasnferTransaction | null>>(
    ([tokenListItems, walletAddress, signer]) => {
      const transactionEvents = tokenListItems.map(tokenListItem => {
        const { chain, address } = tokenListItem;
        try {
          const services = getDefinedServices(chain);
          const erc20TokenService = services.ERC20TokenServiceGetter(address, chain, signer as JsonRpcSigner);
          const subject$ = new BehaviorSubject<TrasnferTransaction | null>(null);
          const listener = (fromAddress: string, toAddress: string) =>
            subject$.next({
              fromAddress,
              toAddress,
              walletAddress,
              token: tokenListItem,
            });

          // TODO: should we call offTransfer()? this stream will only run when wallet changes anyway
          erc20TokenService.onTransfer(walletAddress, null, listener);
          erc20TokenService.onTransfer(null, walletAddress, listener);

          return subject$.pipe(filter(item => Boolean(item)));
        } catch (error) {
          console.error(
            `useTransactions - cannot listen on chain events for token ${address} on ${chain} for $wallet ${walletAddress}`,
            error,
          );
          return of(null);
        }
      });
      return merge(...transactionEvents);
    },
  ),
  filter(transction => Boolean(transction)),
);
