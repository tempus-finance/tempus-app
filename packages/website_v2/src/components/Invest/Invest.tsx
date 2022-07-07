import { memo } from 'react';

import CoinGeckoIcon from '../../icons/CoinGeckoIcon';
import CoinMarketCapIcon from '../../icons/CoinMarketCapIcon';
import { LinkBlock, ScrollFadeIn } from '../shared';
import InvestBackground from './InvestBackground';

import './Invest.scss';

const Invest = (): JSX.Element => (
  <div className="tw__invest">
    <div className="tw__invest__background">
      <InvestBackground />
    </div>
    <div className="tw__container tw__invest__container">
      <ScrollFadeIn>
        <h2 className="tw__invest__title">Invest in the future</h2>
        <div className="tw__invest__content">
          <p className="tw__invest__description">
            Tempus DAO is governed by TEMP token holders. TEMP token holders capture value from all products built by
            Tempus.
          </p>
          <div className="tw__invest__links">
            <LinkBlock href="https://www.coingecko.com/en/coins/tempus" title="CoinGecko" icon={<CoinGeckoIcon />} />
            <LinkBlock
              href="https://coinmarketcap.com/currencies/tempus/"
              title="CoinMarketCap"
              icon={<CoinMarketCapIcon />}
            />
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  </div>
);

export default memo(Invest);
