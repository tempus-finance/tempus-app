import { useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import TokenCirculatingSupplyService from '../../services/TokenCirculatingSupplyService';
import TokenHoldersService from '../../services/TokenHoldersService';
import TokenPriceService from '../../services/TokenPriceService';

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
  });

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
    <div className="tw__tokenomics__token-info">
      <div className="tw__container tw__tokenomics__token-info-container">
        <div className="tw__tokenomics__token-price">
          <div className="tw__tokenomics__token-info-title">TEMP price</div>
          <div className="tw__tokenomics__token-info-value">{priceFormatted}</div>
        </div>
        <div className="tw__tokenomics__supply">
          <div className="tw__tokenomics__token-info-title">Circulating supply</div>
          <div className="tw__tokenomics__token-info-value">{circulatingSupplyFormatted}</div>
        </div>
        <div className="tw__tokenomics__capitalization">
          <div className="tw__tokenomics__token-info-title">Market capitalization</div>
          <div className="tw__tokenomics__token-info-value">{marketCapFormatted}</div>
        </div>
        <div className="tw__tokenomics__holders">
          <div className="tw__tokenomics__token-info-title">Holders</div>
          <div className="tw__tokenomics__token-info-value">{holdersCount ?? '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
