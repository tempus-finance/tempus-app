import PoolShareBalanceProvider from './poolShareBalanceProvider';

let poolShareBalanceProvider: PoolShareBalanceProvider;
const getPoolShareBalanceProvider = (): PoolShareBalanceProvider => {
  if (!poolShareBalanceProvider) {
    poolShareBalanceProvider = new PoolShareBalanceProvider();
    poolShareBalanceProvider.init();
  }

  return poolShareBalanceProvider;
};

export default getPoolShareBalanceProvider;
