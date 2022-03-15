import { BalanceProviderParams } from './interfaces';
import UserShareTokenBalanceProvider from './userShareTokenBalanceProvider';

// Key - User wallet address
// Value - Provider instance
const userShareTokenBalanceProviderMap = new Map<string, UserShareTokenBalanceProvider>();
const getUserShareTokenBalanceProvider = (params: BalanceProviderParams): UserShareTokenBalanceProvider => {
  let userShareTokenBalanceProvider = userShareTokenBalanceProviderMap.get(params.userWalletAddress);
  if (!userShareTokenBalanceProvider) {
    userShareTokenBalanceProvider = new UserShareTokenBalanceProvider(params);

    userShareTokenBalanceProviderMap.set(params.userWalletAddress, userShareTokenBalanceProvider);
  }

  return userShareTokenBalanceProvider;
};

export default getUserShareTokenBalanceProvider;
