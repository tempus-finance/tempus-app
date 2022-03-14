import { BalanceProviderParams } from './interfaces';
import AvailableToDepositProvider from './availableToDepositProvider';

// Key - User wallet address
// Value - Provider instance
const availableToDepositProviderMap = new Map<string, AvailableToDepositProvider>();
const getAvailableToDepositProvider = (params: BalanceProviderParams): AvailableToDepositProvider => {
  let availableToDepositProvider = availableToDepositProviderMap.get(params.userWalletAddress);
  if (!availableToDepositProvider) {
    availableToDepositProvider = new AvailableToDepositProvider(params);

    availableToDepositProviderMap.set(params.userWalletAddress, availableToDepositProvider);
  }

  return availableToDepositProvider;
};

export default getAvailableToDepositProvider;
