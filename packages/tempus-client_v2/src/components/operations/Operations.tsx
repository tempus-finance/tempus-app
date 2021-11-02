import { FC, useContext, useState } from 'react';
import { LanguageContext } from '../../context/language';
import { TransactionView } from '../../interfaces/TransactionView';
import UserLPTokenBalanceProvider from '../../providers/userLPTokenBalanceProvider';
import UserShareTokenBalanceProvider from '../../providers/userShareTokenBalanceProvider';
import CurrentPosition from '../currentPosition/CurrentPosition';
import Deposit from '../deposit/Deposit';
import Pool from '../pool/Pool';
import ProfitLoss from '../profitLoss/ProfitLoss';
import Sidebar from '../sidebar/Sidebar';
import Term from '../term/Term';
import './Operations.scss';

type OperationsInProps = {
  selectedPool: string;
};

const Operations: FC<OperationsInProps> = () => {
  const { language } = useContext(LanguageContext);
  const [selectedView, setSelectedView] = useState<TransactionView>('Deposit');
  const [showExtraInfo] = useState<boolean>(true);

  // TODO: showExtraInfo should be true only if the user has a positive balance in the pool

  return (
    <div className="tc__operations">
      <Sidebar initialView="Deposit" onSelectedView={setSelectedView} />
      <div className="tc__dashboard">
        <div className="tc__dashboard__row">
          <Pool language={language} />
          <Term language={language} />
          <CurrentPosition language={language} />
        </div>
        <div className="tc__dashboard__row">
          {selectedView === 'Deposit' && <Deposit showExtraInfo={showExtraInfo} />}

          {showExtraInfo && <ProfitLoss language={language} />}
        </div>
      </div>
      <UserShareTokenBalanceProvider />
      <UserLPTokenBalanceProvider />
    </div>
  );
};

export default Operations;
