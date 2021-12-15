import UserBalanceProvider, { UserBalanceProviderParams } from './balanceProvider';

// Key - User wallet address
// Value - Provider instance
const getUserBalanceProvider = (params: UserBalanceProviderParams): UserBalanceProvider => {
  return new UserBalanceProvider(params);
};

export default getUserBalanceProvider;
