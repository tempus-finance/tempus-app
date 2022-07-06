import { LinkBlock } from '../shared';
import { CoinGeckoIcon, CoinMarketCapIcon } from './icons';
import './Invest.scss';
import InvestBackground from './InvestBackground';

const Invest = (): JSX.Element => (
  <div className="tw__invest">
    <div className="tw__invest__background">
      <InvestBackground />
    </div>
    <div className="tw__container tw__invest__container">
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
    </div>
  </div>
);

export default Invest;
