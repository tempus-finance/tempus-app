import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chain, Decimal, ProtocolName, TempusPool, Ticker, tokenColorMap } from 'tempus-core-services';
import { PoolCardVariant } from '../PoolCard/PoolCardTypes';
import { useFixedAprs } from '../../../hooks';
import ActionButton from '../ActionButton';
import PoolCard, { PoolCardStatus } from '../PoolCard';

import './PoolCardGrid.scss';

export interface PoolCardData {
  chain: Chain;
  token: Ticker;
  tokenAddress: string;
  protocol: ProtocolName;
  matured: boolean;
  totalBalance?: Decimal;
  pools: TempusPool[];
}

export interface PoolCardGridProps {
  chain: Chain;
  cards: PoolCardData[];
  cardVariant: PoolCardVariant;
  onCardClick: (
    chain: Chain,
    ticker: Ticker,
    protocol: ProtocolName,
    status: PoolCardStatus,
    poolAddresses: string[],
  ) => void;
}

export const NUMBER_OF_CARDS_PER_PAGE = 6;
export const NUMBER_OF_CARDS_SHOW_AT_START = 3;

const PoolCardGrid: FC<PoolCardGridProps> = props => {
  const { chain, cards, cardVariant, onCardClick } = props;
  const fixedAprs = useFixedAprs();
  const { t } = useTranslation();

  // When users clicks show more button, number of visible pools is increased
  // When user sorts/filters pool list - number of visible pools for each chain is reset
  const [visiblePools, setVisiblePools] = useState(NUMBER_OF_CARDS_SHOW_AT_START);

  // Reset number of visible pools when tempus pools list changes (ie. user filtered/sorted pools)
  useEffect(() => {
    setVisiblePools(NUMBER_OF_CARDS_SHOW_AT_START);
  }, [cards]);

  const onShowMoreClick = useCallback(() => {
    setVisiblePools(prevState => (prevState || NUMBER_OF_CARDS_SHOW_AT_START) + NUMBER_OF_CARDS_PER_PAGE);
  }, []);

  const cardsToShow = cards.slice(0, visiblePools || NUMBER_OF_CARDS_SHOW_AT_START);

  return (
    <div className="tc__pool-card-grid">
      <div className="tc__pool-card-grid__content">
        {cardsToShow.map(card => {
          const cardColor = tokenColorMap.get(card.token);
          if (!cardColor) {
            console.warn(`Missing ${card.token} token color in tokenColorMap!`);
          }

          const terms = card.pools.map(pool => new Date(pool.maturityDate));
          const poolAddresses = card.pools.map(pool => pool.address);
          const aprs = card.pools.map(pool => fixedAprs[`${pool.chain}-${pool.address}`]);

          let cardStatus: PoolCardStatus = 'Fixed';
          if (card.matured) {
            cardStatus = 'Matured';
          }

          return (
            <PoolCard
              key={`${chain}-${card.protocol}-${card.tokenAddress}-${card.matured}`}
              aprValues={aprs}
              color={cardColor || '#ffffff'}
              poolCardStatus={cardStatus}
              poolCardVariant={cardVariant}
              ticker={card.token}
              protocol={card.protocol}
              terms={terms}
              chain={card.chain}
              onClick={onCardClick}
              poolAddresses={poolAddresses}
              totalBalance={card.totalBalance}
            />
          );
        })}
      </div>
      {cardsToShow.length < cards.length && (
        <div className="tc__pool-card-grid__show-more">
          {/* show more button */}
          <ActionButton
            labels={{
              default:
                cards.length - cardsToShow.length > NUMBER_OF_CARDS_PER_PAGE
                  ? t('MarketsPools.showMoreXOfYButtonLabel', {
                      numOfCardsToShow: NUMBER_OF_CARDS_PER_PAGE,
                      numOfRemainingCards: cards.length - cardsToShow.length,
                    })
                  : t('MarketsPools.showMoreXButtonLabel', {
                      numOfCardsToShow: cards.length - cardsToShow.length,
                    }),
              loading: '',
              success: '',
            }}
            onClick={onShowMoreClick}
            variant="secondary"
            size="large"
          />
        </div>
      )}
    </div>
  );
};

export default PoolCardGrid;
