import { FC, useContext } from 'react';
import getText from '../../localisation/getText';
import { LanguageContext } from '../../context/language';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import Typography from '../typography/Typography';
import './Deposit.scss';

export type SelectedYield = 'Fixed' | 'Variable';

const DetailDeposit: FC = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="tc__deposit">
      <div className="tc__deposit__from">
        <Typography variant="h1">{getText('from', language)}</Typography>
        <div className="tc__deposit__from__body">
          <div>Token Selector</div>
          <div>
            <CurrencyInput defaultValue="0" onChange={() => null} />
          </div>
          <div>Balance</div>
          <div>
            <Approve language={language} />
          </div>
        </div>
      </div>
      <div className="tc__deposit__to">
        <Typography variant="h1">{getText('to', language)}</Typography>
        <div className="tc__deposit__to__body">
          <div className="tc__deposit__select-yield">
            <div>Fixed Yield Box</div>
            <div>Variable Yield Box</div>
          </div>
          <div>
            <Execute language={language} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDeposit;
