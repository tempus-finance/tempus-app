import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Chain, prettifyChainName, ProtocolName, TempusPool, Ticker, tokenColorMap } from 'tempus-core-services';
import { useChainList, useFilteredSortedPoolList, useFixedAprs, useSelectedChain } from '../../../hooks';
import { PoolCard, PoolCardStatus, PoolsHeading } from '../../shared';
import ShowMoreButtonWrapper from './ShowMoreButtonWrapper';

import './MarketsPools.scss';

const NUMBER_OF_CARDS_PER_PAGE = 6;
const NUMBER_OF_CARDS_SHOW_AT_START = 3;

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
  const fixedAprs = useFixedAprs();

  // When users clicks show more button, number of visible pools is increased
  // When user sorts/filters pool list - number of visible pools for each chain is reset
  const [visibleChainPools, setVisibleChainPools] = useState<{ [key in Chain]?: number }>({});

  // Reset number of visible pools when tempus pools list changes (ie. user filtered/sorted pools)
  useEffect(() => {
    const result: { [key in Chain]?: number } = {};

    chains.forEach(chain => {
      result[chain] = NUMBER_OF_CARDS_SHOW_AT_START;
    });

    setVisibleChainPools(result);
  }, [tempusPools, chains]);

  const onShowMoreClick = useCallback((chain: Chain) => {
    setVisibleChainPools(prevState => ({
      ...prevState,
      [chain]: (prevState[chain] || NUMBER_OF_CARDS_SHOW_AT_START) + NUMBER_OF_CARDS_PER_PAGE,
    }));
  }, []);

  /**
   * If user wallet is connected and selected chain is available we want to show pools only from selected network,
   * otherwise, show pools from all available networks.
   */
  const availableChains = useMemo(() => (selectedChain ? [selectedChain] : chains), [selectedChain, chains]);
  const handleClick = (
    chain: Chain,
    ticker: Ticker,
    protocol: ProtocolName,
    status: PoolCardStatus,
    poolAddresses: string[],
  ) => {
    if (status === 'Matured') {
      // Matured pool card always contains single pool
      const poolAddress = poolAddresses[0];
      if (!poolAddress) {
        console.warn('Failed to get pool address from Matured pool card!');
        return;
      }

      navigate(`/mature-pool/${chain}/${ticker}/${protocol}/${poolAddress}`);
    } else {
      navigate(`/pool/${chain}/${ticker}/${protocol}`);
    }
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

        const cardsToShow = chainCards.slice(0, visibleChainPools[chain] || NUMBER_OF_CARDS_SHOW_AT_START);

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
                const poolAddresses = chainCard.pools.map(pool => pool.address);
                const aprs = chainCard.pools.map(pool => fixedAprs[`${pool.chain}-${pool.address}`]);

                let cardStatus: PoolCardStatus = 'Fixed';
                if (chainCard.matured) {
                  cardStatus = 'Matured';
                }

                let cardStatus: PoolCardStatus = 'Fixed';
                if (chainCard.matured) {
                  cardStatus = 'Matured';
                }

                return (
                  <PoolCard
                    key={`${chain}-${chainCard.protocol}-${chainCard.tokenAddress}-${chainCard.matured}`}
                    aprValues={aprs}
                    color={cardColor || '#ffffff'}
                    poolCardStatus={cardStatus}
                    poolCardVariant="markets"
                    ticker={chainCard.token}
                    protocol={chainCard.protocol}
                    terms={terms}
                    chain={chainCard.chain}
                    onClick={handleClick}
                    poolAddresses={poolAddresses}
                  />
                );
              })}
            </div>
            {cardsToShow.length < chainCards.length && (
              <div className="tc__marketsPools-showMore">
                <ShowMoreButtonWrapper
                  chain={chain}
                  onClick={onShowMoreClick}
                  label={
                    chainCards.length - cardsToShow.length > NUMBER_OF_CARDS_PER_PAGE
                      ? t('MarketsPools.showMoreXOfYButtonLabel', {
                          numOfCardsToShow: NUMBER_OF_CARDS_PER_PAGE,
                          numOfRemainingCards: chainCards.length - cardsToShow.length,
                        })
                      : t('MarketsPools.showMoreXButtonLabel', {
                          numOfCardsToShow: chainCards.length - cardsToShow.length,
                        })
                  }
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
