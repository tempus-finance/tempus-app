import { BalanceProviderParams } from './interfaces';
import UserLPTokenBalanceProvider from './userLPTokenBalanceProvider';

// Key - User wallet address
// Value - Provider instance
const userLPTokenBalanceProviderMap = new Map<string, UserLPTokenBalanceProvider>();
const getUserLPTokenBalanceProvider = (params: BalanceProviderParams): UserLPTokenBalanceProvider => {
  let userLPTokenBalanceProvider = userLPTokenBalanceProviderMap.get(params.userWalletAddress);
  if (!userLPTokenBalanceProvider) {
    userLPTokenBalanceProvider = new UserLPTokenBalanceProvider(params);

    userLPTokenBalanceProviderMap.set(params.userWalletAddress, userLPTokenBalanceProvider);
  }

  return userLPTokenBalanceProvider;
};

export default getUserLPTokenBalanceProvider;
