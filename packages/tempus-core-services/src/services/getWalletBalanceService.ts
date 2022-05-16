import { Chain } from '../interfaces';
import { WalletBalanceService } from './WalletBalanceService';

const walletBalanceServices = new Map<Chain, WalletBalanceService>();
export function getWalletBalanceService(chain: Chain): WalletBalanceService {
  if (!walletBalanceServices.get(chain)) {
    walletBalanceServices.set(chain, new WalletBalanceService(chain));
  }

  const walletBalanceService = walletBalanceServices.get(chain);
  if (!walletBalanceService) {
    throw new Error(`getWalletBalanceService() - Failed to get walletBalanceService for ${chain} chain!`);
  }

  return walletBalanceService;
}
