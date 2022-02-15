import { BalanceProviderParams } from './interfaces';
import UserYieldBearingTokenBalanceProvider from './userYieldBearingTokenBalanceProvider';

// Key - User wallet address
// Value - Provider instance
const userYieldBearingTokenBalanceProviderMap = new Map<string, UserYieldBearingTokenBalanceProvider>();
const getYieldBearingTokenBalanceProvider = (params: BalanceProviderParams): UserYieldBearingTokenBalanceProvider => {
  let userYieldBearingTokenBalanceProvider = userYieldBearingTokenBalanceProviderMap.get(params.userWalletAddress);
  if (!userYieldBearingTokenBalanceProvider) {
    userYieldBearingTokenBalanceProvider = new UserYieldBearingTokenBalanceProvider(params);

    userYieldBearingTokenBalanceProviderMap.set(params.userWalletAddress, userYieldBearingTokenBalanceProvider);
  }

  return userYieldBearingTokenBalanceProvider;
};

export default getYieldBearingTokenBalanceProvider;
