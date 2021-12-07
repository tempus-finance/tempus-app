import UserShareTokenBalanceProvider, { UserShareTokenBalanceProviderParams } from './userShareTokenBalanceProvider';

// Key - User wallet address
// Value - Provider instance
const userShareTokenBalanceProviderMap = new Map<string, UserShareTokenBalanceProvider>();
const getUserShareTokenBalanceProvider = (
  params: UserShareTokenBalanceProviderParams,
): UserShareTokenBalanceProvider => {
  let userShareTokenBalanceProvider = userShareTokenBalanceProviderMap.get(params.userWalletAddress);
  if (!userShareTokenBalanceProvider) {
    userShareTokenBalanceProvider = new UserShareTokenBalanceProvider(params);

    userShareTokenBalanceProviderMap.set(params.userWalletAddress, userShareTokenBalanceProvider);
  }

  return userShareTokenBalanceProvider;
};

export default getUserShareTokenBalanceProvider;
