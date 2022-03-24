import { FC, useContext, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Downgraded, useHookstate } from '@hookstate/core';
import { Chain } from 'tempus-core-services';
import { UserSettingsContext } from '../../context/userSettingsContext';
import { WalletContext } from '../../context/walletContext';
import { dynamicPoolDataState, selectedPoolState } from '../../state/PoolDataState';
import Operations from '../operations/Operations';
import usePoolNetworkValidCheck from '../../hooks/usePoolNetworkValidCheck';

interface PoolRouteProps {
  chain: Chain;
}

const PoolRoute: FC<PoolRouteProps> = props => {
  const { chain } = props;

  const { userWalletConnected } = useContext(WalletContext);
  const { setUserSettings } = useContext(UserSettingsContext);

  const selectedPool = useHookstate(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);

  const [poolShareBalanceLoaded, setPoolShareBalanceLoaded] = useState<boolean>(false);

  const isPoolNetworkValid = usePoolNetworkValidCheck();

  const params = useParams();

  let poolShareBalance: {
    principals: BigNumber | null;
    yields: BigNumber | null;
  } = {
    principals: null,
    yields: null,
  };
  if (params.poolAddress) {
    poolShareBalance = dynamicPoolData[params.poolAddress].poolShareBalance.attach(Downgraded).get();
  }

  useEffect(() => {
    if (params.poolAddress && userWalletConnected) {
      if (poolShareBalance.principals && poolShareBalance.yields) {
        setPoolShareBalanceLoaded(true);
      }
    }
  }, [params.poolAddress, poolShareBalance.principals, poolShareBalance.yields, userWalletConnected]);

  useEffect(() => {
    if (params.poolAddress) {
      // TODO - Refactor whole app to use pool address from URL instead of using it from state
      selectedPool.set(params.poolAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.poolAddress]);

  useEffect(() => {
    if (setUserSettings) {
      setUserSettings(prevState => ({
        ...prevState,
        openWalletSelector: !userWalletConnected,
        isWalletSelectorIrremovable: !userWalletConnected,
      }));
    }
  }, [userWalletConnected, setUserSettings]);

  if (!selectedPool.get()) {
    return null;
  }

  // if pool is selected but with wrong network, redirect to dashboard
  if (!isPoolNetworkValid) {
    return <Navigate to="/" replace={true} />;
  }

  // Do not show pool UI before all required data is loaded
  // Triggered when user opens direct pool link
  if (!poolShareBalanceLoaded) {
    return null;
  }

  return <Operations chain={chain} />;
};
export default PoolRoute;
