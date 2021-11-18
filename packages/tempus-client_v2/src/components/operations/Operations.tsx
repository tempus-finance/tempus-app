import { useCallback, useContext, useState } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState } from '../../state/PoolDataState';
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

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);

  const [selectedView, setSelectedView] = useState<TransactionView>('deposit');

  const handleWithdraw = useCallback(() => {
    setSelectedView('deposit');
  }, []);

  if (!userWalletSigner || !selectedPool.get()) {
    return null;
  }

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.get();
  const userLPBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.get();

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
