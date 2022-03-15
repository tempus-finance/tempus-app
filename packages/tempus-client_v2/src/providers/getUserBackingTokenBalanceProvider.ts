import { BalanceProviderParams } from './interfaces';
import UserBackingTokenBalanceProvider from './userBackingTokenBalanceProvider';

// Key - User wallet address
// Value - Provider instance
const userBackingTokenBalanceProviderMap = new Map<string, UserBackingTokenBalanceProvider>();
const getBackingTokenBalanceProvider = (params: BalanceProviderParams): UserBackingTokenBalanceProvider => {
  let userBackingTokenBalanceProvider = userBackingTokenBalanceProviderMap.get(params.userWalletAddress);
  if (!userBackingTokenBalanceProvider) {
    userBackingTokenBalanceProvider = new UserBackingTokenBalanceProvider(params);

    userBackingTokenBalanceProviderMap.set(params.userWalletAddress, userBackingTokenBalanceProvider);
  }

  return userBackingTokenBalanceProvider;
};

export default getBackingTokenBalanceProvider;
