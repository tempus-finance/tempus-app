import { useContext, useState } from 'react';
import { ethers } from 'ethers';
import { LanguageContext } from '../../context/languageContext';
import { Ticker } from '../../interfaces/Token';
import getText from '../../localisation/getText';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';
import './Deposit.scss';

const Deposit = () => {
  const { language } = useContext(LanguageContext);

  const [balance] = useState<number>(123);
  const [token] = useState<Ticker>('ETH');

  const [tokenPrecision] = useState<number>(0);

  return (
    <div className="tc__deposit">
      <div className="tc__deposit__from">
        <Typography variant="h1">{getText('from', language)}</Typography>
        <div className="tc__deposit__from__body">
          <div>
            <TokenSelector defaultTicker={token} tickers={[token, 'stETH']} />
          </div>
          <div>
            <CurrencyInput defaultValue="0" onChange={() => null} />
          </div>
          <div>
            <Typography variant="body-text">
              {getText('balance', language)} {balance ? ethers.utils.formatUnits(balance, tokenPrecision) : ''}
            </Typography>
            <TokenIcon ticker={token} />
          </div>
        </div>
      </div>
      <div className="tc__deposit__to">
        <Typography variant="h1">{getText('to', language)}</Typography>
        <div className="tc__deposit__to__body">
          <div className="tc__deposit__select-yield">
            <div className="tc__deposit__yield tc__deposit__fixed-yield">
              <div className="tc__deposit__yield-title">
                <Typography variant="h2">{getText('fixYourFutureYield', language)}</Typography>
                <Typography variant="body-text" color="title">
                  {getText('fixedYield', language)}
                </Typography>
              </div>
              <div className="tc__deposit__yield-body">
                <div className="tc__deposit__yield-body__row">
                  <Typography variant="body-text" color="title">
                    {getText('fixedYieldAtMaturity', language)}
                  </Typography>
                  <div className="tc__deposit__yield-body__right">
                    <Typography variant="body-text" color="success">
                      +000.6{token}
                    </Typography>
                    <Typography variant="body-text" color="success">
                      +$400.123$
                    </Typography>
                  </div>
                </div>
                <div className="tc__deposit__yield-body__row">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                  <div className="tc__deposit__yield-body__right">
                    <Typography variant="body-text">
                      {ethers.utils.formatUnits(balance, tokenPrecision)}
                      {token}
                    </Typography>

                    <Typography variant="body-text">$1400.123$</Typography>
                  </div>
                </div>
              </div>
              <div className="tc__deposit__yield-bottom">
                <Typography variant="button-text">1.0000 {getText('principals', language)}</Typography>
                <Typography variant="button-text" color="accent">
                  APR 5.3%
                </Typography>
              </div>
            </div>
            <div className="tc__deposit__yield tc__deposit__variable-yield">
              <div className="tc__deposit__yield-title">
                <Typography variant="h2">{getText('provideLiquidity', language)}</Typography>
                <Typography variant="body-text" color="title">
                  {getText('variableYield', language)}
                </Typography>
              </div>
              <div className="tc__deposit__yield-body"></div>
              <div className="tc__deposit__yield-bottom">
                <Typography variant="button-text">1.0000 {getText('principals', language)}</Typography>
                <Typography variant="button-text" color="accent">
                  APR 5.3%
                </Typography>
              </div>
              <div className="tc__deposit__yield-bottom">
                <Typography variant="button-text">1.0000 {getText('lpTokens', language)}</Typography>
                <Typography variant="button-text" color="accent">
                  APR 5.3%
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="tc__deposit__actions">
          <Approve language={language} />
          <Execute language={language} />
        </div>
      </div>
    </div>
  );
};

export default Deposit;
