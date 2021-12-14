import UserBalanceProvider, { UserBalanceProviderParams } from './balanceProvider';

// Key - User wallet address
// Value - Provider instance
const userBalanceProviderMap = new Map<string, UserBalanceProvider>();
const getUserBalanceProvider = (params: UserBalanceProviderParams): UserBalanceProvider => {
  let userBalanceProvider = userBalanceProviderMap.get(params.userWalletAddress);
  if (!userBalanceProvider) {
    userBalanceProvider = new UserBalanceProvider(params);

    userBalanceProviderMap.set(params.userWalletAddress, userBalanceProvider);
  }

  return userBalanceProvider;
};

export default getUserBalanceProvider;
