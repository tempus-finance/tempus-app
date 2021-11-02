import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from '../../context/languageContext';
import { TransactionView } from '../../interfaces/TransactionView';
import UserLPTokenBalanceProvider from '../../providers/userLPTokenBalanceProvider';
import UserShareTokenBalanceProvider from '../../providers/userShareTokenBalanceProvider';
import CurrentPosition from '../currentPosition/CurrentPosition';
import Deposit from '../deposit/Deposit';
import Pool from '../pool/Pool';
import Sidebar from '../sidebar/Sidebar';
import Term from '../term/Term';
import './Operations.scss';

type OperationsInProps = {
  selectedPool: string;
};

const Operations: FC<OperationsInProps> = () => {
  const { language } = useContext(LanguageContext);
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
            <Pool language={language} />
            <Term language={language} />
          </div>
          {/* Middle bottom part (Selected tab options) */}
          <div className="tc__operations-poolManage">{selectedView === 'Deposit' && <Deposit />}</div>
        </div>
        {/* Right side (Current Position, Profit/Loss) - Only visible if user has balance in the pool */}
        {!hideUserData && (
          <div className="tc__operations-poolUserStats">
            <CurrentPosition language={language} />
          </div>
        )}
      </div>
      <UserShareTokenBalanceProvider />
      <UserLPTokenBalanceProvider />
    </div>
  );
};

export default Operations;
