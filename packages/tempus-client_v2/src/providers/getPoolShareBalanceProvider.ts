import PoolShareBalanceProvider from './poolShareBalanceProvider';

const poolShareBalanceProvider = new PoolShareBalanceProvider();
const getPoolShareBalanceProvider = (): PoolShareBalanceProvider => {
  return poolShareBalanceProvider;
};

export default getPoolShareBalanceProvider;
