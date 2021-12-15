import UserBalanceProvider, { UserBalanceProviderParams } from './balanceProvider';

const getUserBalanceProvider = (params: UserBalanceProviderParams): UserBalanceProvider => {
  return new UserBalanceProvider(params);
};

export default getUserBalanceProvider;
