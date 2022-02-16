import UserBalanceProvider from './balanceProvider';
import { BalanceProviderParams } from './interfaces';

const getUserBalanceProvider = (params: BalanceProviderParams): UserBalanceProvider => {
  return new UserBalanceProvider(params);
};

export default getUserBalanceProvider;
