import { FC, useContext, useMemo, useState } from 'react';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
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

type OperationsInProps = {
  selectedPool: string;
};

const Operations: FC<OperationsInProps> = () => {
  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [selectedView, setSelectedView] = useState<TransactionView>('Deposit');

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const hideUserData = useMemo(() => {
    const { userPrincipalsBalance, userYieldsBalance, userLPTokenBalance } = activePoolData;

    if (!userPrincipalsBalance || !userYieldsBalance || !userLPTokenBalance) {
      return true;
    }

    return userPrincipalsBalance.isZero() && userYieldsBalance.isZero() && userLPTokenBalance?.isZero();
  }, [activePoolData]);

  return (
    userWalletSigner &&
    poolData && (
      <div className="tc__operations">
        {/* Sidebar */}
        <div className="tc__operations-sidebar">
          <Sidebar initialView="Deposit" onSelectedView={setSelectedView} />
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
              {selectedView === 'Deposit' && (
                <Deposit poolDataAdapter={getPoolDataAdapter(userWalletSigner)} narrow={!hideUserData} />
              )}
              {selectedView === 'Withdraw' && <Withdraw />}
              {selectedView === 'Mint' && <Mint narrow={!hideUserData} />}
              {selectedView === 'Swap' && <Swap />}
              {selectedView === 'Provide Liquidity' && <ProvideLiquidity />}
              {selectedView === 'Remove Liquidity' && <RemoveLiquidity />}
              {selectedView === 'Early Redeem' && <EarlyRedeem />}
            </div>
          </div>
          {/* Right side (Current Position, Profit/Loss) - Only visible if user has balance in the pool */}
          {!hideUserData && (
            <div className="tc__operations-poolUserStats">
              <CurrentPosition language={language} />
              <ProfitLoss language={language} />
            </div>
          )}
        </div>
        <UserShareTokenBalanceProvider />
        <UserLPTokenBalanceProvider />
      </div>
    )
  );
};

export default Operations;
