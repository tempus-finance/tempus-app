import PoolShareBalanceProvider, { PoolShareBalanceProviderParams } from './poolShareBalanceProvider';

let poolShareBalanceProvider: PoolShareBalanceProvider;
const getPoolShareBalanceProvider = (params: PoolShareBalanceProviderParams): PoolShareBalanceProvider => {
  if (!poolShareBalanceProvider) {
    poolShareBalanceProvider = new PoolShareBalanceProvider(params);
  }

  return poolShareBalanceProvider;
};

export default getPoolShareBalanceProvider;
