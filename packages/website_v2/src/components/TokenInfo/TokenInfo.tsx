import { memo, useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import TokenCirculatingSupplyService from '../../services/TokenCirculatingSupplyService';
import TokenHoldersService from '../../services/TokenHoldersService';
import TokenPriceService from '../../services/TokenPriceService';
import { ScrollFadeIn } from '../shared';

import './TokenInfo.scss';

const TokenInfo = (): JSX.Element => {
  const [price, setPrice] = useState<Decimal | null>(null);
  const [circulatingSupply, setCirculatingSupply] = useState<Decimal | null>(null);
  const [holdersCount, setHoldersCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      setPrice(await TokenPriceService.getPrice());
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    const fetchCirculatingSupply = async () => {
      setCirculatingSupply(await TokenCirculatingSupplyService.getCirculatingSupply());
    };
    fetchCirculatingSupply();
  }, []);

  useEffect(() => {
    const fetchHoldersCount = async () => {
      setHoldersCount(await TokenHoldersService.getHoldersCount());
    };
    fetchHoldersCount();
  }, []);

  const priceFormatted = useMemo(() => (price ? DecimalUtils.formatToCurrency(price, 4, '$') : '-'), [price]);

  const circulatingSupplyFormatted = useMemo(
    () => (circulatingSupply ? DecimalUtils.formatWithMultiplier(circulatingSupply, 0) : '-'),
    [circulatingSupply],
  );

  const marketCapFormatted = useMemo(() => {
    if (!price || !circulatingSupply) {
      return '-';
    }

    return `$${DecimalUtils.formatWithMultiplier(circulatingSupply.mul(price), 2)}`;
  }, [price, circulatingSupply]);

  return (
    <div className="tw__token-info">
      <ScrollFadeIn>
        <div className="tw__container tw__token-info__container">
          <div className="tw__token-info__price">
            <div className="tw__token-info__title">TEMP price</div>
            <div className="tw__token-info__value">{priceFormatted}</div>
          </div>
          <div className="tw__token-info__supply">
            <div className="tw__token-info__title">Circulating supply</div>
            <div className="tw__token-info__value">{circulatingSupplyFormatted}</div>
          </div>
          <div className="tw__token-info__capitalization">
            <div className="tw__token-info__title">Market capitalization</div>
            <div className="tw__token-info__value">{marketCapFormatted}</div>
          </div>
          <div className="tw__token-info__holders">
            <div className="tw__token-info__title">Holders</div>
            <div className="tw__token-info__value">{holdersCount ?? '-'}</div>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  );
};

export default memo(TokenInfo);
