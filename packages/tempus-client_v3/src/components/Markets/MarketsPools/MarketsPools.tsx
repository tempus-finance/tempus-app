import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { ActionButton, PoolCard, PoolsHeading } from '../../shared';
import './MarketsPools.scss';

const NUMBER_OF_CARDS_PER_PAGE = 3;

interface CardData {
  token: Ticker;
  tokenAddress: string;
  protocol: ProtocolName;
  pools: TempusPool[];
}

const MarketsPools = (): JSX.Element => {
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

          const tokenCard = chainCards.find(
            card => card.token === pool.backingToken && card.protocol === pool.protocol,
          );
          if (tokenCard) {
            tokenCard.pools.push(pool);
          } else {
            chainCards.push({
              pools: [pool],
              token: pool.backingToken,
              tokenAddress: pool.backingTokenAddress,
              protocol: pool.protocol,
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

                return (
                  <PoolCard
                    key={`${chain}-${chainCard.protocol}-${chainCard.tokenAddress}`}
                    aprValues={[new Decimal(0.1)]}
                    color={cardColor || '#ffffff'}
                    poolCardStatus="Fixed"
                    poolCardVariant="markets"
                    ticker={chainCard.token}
                    protocol={chainCard.protocol}
                    terms={terms}
                  />
                );
              })}
            </div>
            {cardsToShow.length < chainCards.length && (
              <div className="tc__marketsPools-show-more">
                <ActionButton
                  labels={{
                    default: `Show ${
                      cardsToShow.length + NUMBER_OF_CARDS_PER_PAGE > chainCards.length
                        ? chainCards.length
                        : cardsToShow.length + NUMBER_OF_CARDS_PER_PAGE
                    } of ${chainCards.length} more`,
                    loading: '',
                    success: '',
                  }}
                  onClick={() => {
                    onShowMoreClick(chain);
                  }}
                  variant="secondary"
                  size="large"
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
