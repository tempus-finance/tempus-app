import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Chain,
  Decimal,
  prettifyChainName,
  ProtocolName,
  TempusPool,
  Ticker,
  tokenColorMap,
} from 'tempus-core-services';
import { useChainList, useFilteredSortedPoolList, useSelectedChain } from '../../../hooks';
import { PoolCard, PoolCardStatus, PoolsHeading } from '../../shared';
import './MarketsPools.scss';
import ShowMoreButtonWrapper from './ShowMoreButton';

const NUMBER_OF_CARDS_PER_PAGE = 3;

interface CardData {
  chain: Chain;
  token: Ticker;
  tokenAddress: string;
  protocol: ProtocolName;
  matured: boolean;
  pools: TempusPool[];
}

const MarketsPools = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chains = useChainList();
  const tempusPools = useFilteredSortedPoolList();
  const selectedChain = useSelectedChain();

  // When users clicks show more button, number of visible pools is increased
  // When user sorts/filters pool list - number of visible pools for each chain is reset
  const [visibleChainPools, setVisibleChainPools] = useState<{ [key in Chain]?: number }>({});

  // Reset number of visible pools when tempus pools list changes (ie. user filtered/sorted pools)
  useEffect(() => {
    const result: { [key in Chain]?: number } = {};

    chains.forEach(chain => {
      result[chain] = NUMBER_OF_CARDS_PER_PAGE;
    });

    setVisibleChainPools(result);
  }, [tempusPools, chains]);

  const onShowMoreClick = useCallback((chain: Chain) => {
    setVisibleChainPools(prevState => ({
      ...prevState,
      [chain]: (prevState[chain] || NUMBER_OF_CARDS_PER_PAGE) + NUMBER_OF_CARDS_PER_PAGE,
    }));
  }, []);

  /**
   * If user wallet is connected and selected chain is available we want to show pools only from selected network,
   * otherwise, show pools from all available networks.
   */
  const availableChains = useMemo(() => (selectedChain ? [selectedChain] : chains), [selectedChain, chains]);
  const handleClick = (chain: Chain, ticker: Ticker, protocol: ProtocolName) => {
    navigate(`/pool/${chain}/${ticker}/${protocol}`);
  };

  return (
    <div className="tc__marketsPools-container">
      {availableChains.map(chain => {
        const prettyChainName = prettifyChainName(chain);

        // Create a list of cards for Markets page, one card per backing token
        // TODO - Create separate cards for Fixed and Boosted yields
        const chainCards: CardData[] = [];
        tempusPools.forEach(pool => {
          // Skip pools from other chains
          if (pool.chain !== chain) {
            return;
          }

          // We want to show one card per matured pool on markets page
          if (pool.maturityDate < Date.now()) {
            chainCards.push({
              pools: [pool],
              chain: pool.chain,
              token: pool.backingToken,
              tokenAddress: pool.backingTokenAddress,
              protocol: pool.protocol,
              matured: true,
            });
            return;
          }

          const tokenCard = chainCards.find(
            card => card.token === pool.backingToken && card.protocol === pool.protocol && !card.matured,
          );
          if (tokenCard) {
            tokenCard.pools.push(pool);
          } else {
            chainCards.push({
              pools: [pool],
              chain: pool.chain,
              token: pool.backingToken,
              tokenAddress: pool.backingTokenAddress,
              protocol: pool.protocol,
              matured: false,
            });
          }
        });

        // In case chain does not have any cards - skip showing it
        if (chainCards.length === 0) {
          return null;
        }

        const cardsToShow = chainCards.slice(0, visibleChainPools[chain] || NUMBER_OF_CARDS_PER_PAGE);

        return (
          <div key={chain}>
            <PoolsHeading text={`${prettyChainName}-Network pools`} />
            <div className="tc__marketsPools">
              {cardsToShow.map(chainCard => {
                const cardColor = tokenColorMap.get(chainCard.token);
                if (!cardColor) {
                  console.warn(`Missing ${chainCard.token} token color in tokenColorMap!`);
                }

                const terms = chainCard.pools.map(pool => new Date(pool.maturityDate));

                let cardStatus: PoolCardStatus = 'Fixed';
                if (chainCard.matured) {
                  cardStatus = 'Matured';
                }

                return (
                  <PoolCard
                    key={`${chain}-${chainCard.protocol}-${chainCard.tokenAddress}-${chainCard.matured}`}
                    aprValues={[new Decimal(0.1)]}
                    color={cardColor || '#ffffff'}
                    poolCardStatus={cardStatus}
                    poolCardVariant="markets"
                    ticker={chainCard.token}
                    protocol={chainCard.protocol}
                    terms={terms}
                    chain={chainCard.chain}
                    onClick={handleClick}
                  />
                );
              })}
            </div>
            {cardsToShow.length < chainCards.length && (
              <div className="tc__marketsPools-showMore">
                <ShowMoreButtonWrapper
                  chain={chain}
                  onClick={onShowMoreClick}
                  label={t('MarketsPools.showMoreButtonLabel', {
                    numOfCardsToShow: Math.min(cardsToShow.length + NUMBER_OF_CARDS_PER_PAGE, chainCards.length),
                    totalNumOfCards: chainCards.length,
                  })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default MarketsPools;
