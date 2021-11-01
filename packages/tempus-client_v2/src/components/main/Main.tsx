import { FC, useContext } from 'react';
import { LanguageContext } from '../../context/language';

import CurrentPosition from '../currentPosition/CurrentPosition';
import Pool from '../pool/Pool';
import ProfitLoss from '../profitLoss/ProfitLoss';
import Sidebar from '../sidebar/Sidebar';
import Term from '../term/Term';
import './Main.scss';

const Main: FC = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="tc__main">
      <Sidebar />
      <div className="tc__dashboard">
        <div className="tc__dashboard__row">
          <Pool language={language} />
          <Term language={language} />
          <CurrentPosition language={language} />
        </div>
        <div className="tc__dashboard__row">
          <ProfitLoss language={language} />
        </div>
      </div>
    </div>
  );
};

export default Main;
