import { useCallback, useContext, useEffect, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import { TransactionView } from '../../interfaces/TransactionView';
import UserLPTokenBalanceProvider from '../../providers/userLPTokenBalanceProvider';
import UserShareTokenBalanceProvider from '../../providers/userShareTokenBalanceProvider';
import CurrentPosition from '../currentPosition/CurrentPosition';
import Deposit from '../deposit/Deposit';
import EarlyRedeem from '../earlyRedeem/EarlyRedeem';
import Mint from '../mint/Mint';
import Pool from '../pool/Pool';
import ProfitLoss from '../profitLoss/ProfitLoss';
import ProvideLiquidity from '../provideLiquidity/ProvideLiquidity';
import RemoveLiquidity from '../removeLiquidity/RemoveLiquidity';
import Sidebar from '../sidebar/Sidebar';
import Swap from '../swap/Swap';
import Term from '../term/Term';
import Withdraw from '../withdraw/Withdraw';

import './Operations.scss';

const Operations = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);

  const [poolHasBalance, setPoolHasBalance] = useState<boolean | null>(null);
  const [selectedView, setSelectedView] = useState<TransactionView>('deposit');

  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.get();
  const userLPBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.get();

  const handleWithdraw = useCallback(() => {
    setSelectedView('deposit');
  }, []);

  useEffect(() => {
    const fetchPoolBalances = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const poolShares = await poolDataAdapter.getPoolShareBalances(poolId, principalsAddress, yieldsAddress);

      setPoolHasBalance(!poolShares.principals.isZero() || !poolShares.yields.isZero());
    };
    fetchPoolBalances();
  }, [principalsAddress, poolId, userWalletSigner, yieldsAddress]);

  useEffect(() => {
    if (poolHasBalance === false) {
      setSelectedView('mint');
    }
  }, [poolHasBalance]);

  if (!userWalletSigner || !selectedPool.get()) {
    return null;
  }

  const hideUserData =
    (!userPrincipalsBalance || userPrincipalsBalance.isZero()) &&
    (!userYieldsBalance || userYieldsBalance.isZero()) &&
    (!userLPBalance || userLPBalance.isZero());

  return (
    <div className="tc__operations">
      {/* Sidebar */}
      <div className="tc__operations-sidebar">
        <Sidebar initialView={selectedView} onSelectedView={setSelectedView} />
      </div>
      {/* Right side of sidebar (All cards) */}
      <div className="tc__operations-cards-container">
        {/* Middle part (Pool, Term, Selected tab options) */}
        <div className="tc__operations-poolData">
          {/* Middle Top part (Pool, Term) */}
          <div className="tc__operations-poolStats">
            <Pool />
            <Term />
          </div>
          {/* Middle bottom part (Selected tab options) */}
          <div className="tc__operations-poolManage">
            {selectedView === 'deposit' && (
              <Deposit poolDataAdapter={getPoolDataAdapter(userWalletSigner)} narrow={!hideUserData} />
            )}
            {selectedView === 'withdraw' && <Withdraw onWithdraw={handleWithdraw} />}
            {selectedView === 'mint' && <Mint narrow={!hideUserData} />}
            {selectedView === 'swap' && <Swap />}
            {selectedView === 'provideLiquidity' && <ProvideLiquidity />}
            {selectedView === 'removeLiquidity' && <RemoveLiquidity />}
            {selectedView === 'earlyRedeem' && <EarlyRedeem />}
          </div>
        </div>
        {/* Right side (Current Position, Profit/Loss) - Only visible if user has balance in the pool */}
        {!hideUserData && (
          <div className="tc__operations-poolUserStats">
            <CurrentPosition language={language} />
            <ProfitLoss />
          </div>
        )}
      </div>
      <UserShareTokenBalanceProvider />
      <UserLPTokenBalanceProvider />
    </div>
  );
};

export default Operations;
