import { useContext } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { WalletContext } from '../context/walletContext';
import { selectedPoolState } from '../state/PoolDataState';
import { getChainConfig } from '../utils/getConfig';

const usePoolNetworkValidCheck = () => {
  const { userWalletChain } = useContext(WalletContext);
  const selectedPool = useHookState(selectedPoolState);
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();

  return (
    !!userWalletChain &&
    getChainConfig(userWalletChain).tempusPools.findIndex(tempusPool => tempusPool.address === selectedPoolAddress) >= 0
  );
};

export default usePoolNetworkValidCheck;
