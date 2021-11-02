import { FC, useContext, useState } from 'react';
import { LanguageContext } from '../../context/language';
import { TransactionView } from '../../interfaces/TransactionView';
import CurrentPosition from '../currentPosition/CurrentPosition';
import Pool from '../pool/Pool';
import ProfitLoss from '../profitLoss/ProfitLoss';
import Sidebar from '../sidebar/Sidebar';
import Term from '../term/Term';
import './Main.scss';

const Main: FC = () => {
  const { language } = useContext(LanguageContext);
  const [selectedView, setSelectedView] = useState<TransactionView>('Deposit');
  const [showExtraInfo] = useState<boolean>(true);

  // TODO: showExtraInfo should be true only if the user has a positive balance in the pool

  return (
    <div className="tc__main">
      <Sidebar initialView="Deposit" onSelectedView={setSelectedView} />
      <div className="tc__dashboard">
        <div className="tc__dashboard__row">
          <Pool language={language} />
          <Term language={language} />
          <CurrentPosition language={language} />
        </div>
        <div className="tc__dashboard__row">{showExtraInfo && <ProfitLoss language={language} />}</div>
      </div>
    </div>
  );
};

export default Main;
