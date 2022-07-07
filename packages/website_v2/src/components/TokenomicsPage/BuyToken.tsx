import { memo } from 'react';
import CoinGeckoIcon from '../../icons/CoinGeckoIcon';
import CoinMarketCapIcon from '../../icons/CoinMarketCapIcon';
import { LinkBlock, ScrollFadeIn } from '../shared';

const BuyToken = (): JSX.Element => (
  <div className="tw__tokenomics__buy-token">
    <ScrollFadeIn>
      <div className="tw__container tw__tokenomics__buy-token-container">
        <h2 className="tw__tokenomics__title">Where to Buy TEMP</h2>
        <div className="tw__tokenomics__buy-token-links">
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
);

export default memo(BuyToken);
