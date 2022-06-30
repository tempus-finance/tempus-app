import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Chain, prettifyChainName, ProtocolName, Ticker } from 'tempus-core-services';
import { useChainList, useFilteredSortedPoolList, useSelectedChain } from '../../../hooks';
import { PoolCardData, PoolCardGrid, PoolCardStatus, PoolsHeading, Typography } from '../../shared';

import './MarketsPools.scss';

const MarketsPools = (): JSX.Element => {
  const navigate = useNavigate();
  const chains = useChainList();
  const tempusPools = useFilteredSortedPoolList();
  const [selectedChain] = useSelectedChain();
  const { t } = useTranslation();

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

      navigate(`/pool/${chain}/${ticker}/${protocol}/${poolAddress}`);
    } else {
      navigate(`/pool/${chain}/${ticker}/${protocol}`);
    }
  };

  const chainCardsMap = useMemo(() => {
    const cardsMap = new Map<Chain, PoolCardData[]>();

    availableChains.forEach(chain => {
      // Create a list of cards for Markets page, one card per backing token
      // TODO - Create separate cards for Fixed and Boosted yields
      const chainCards: PoolCardData[] = [];
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

      cardsMap.set(chain, chainCards);
    });

    return cardsMap;
  }, [availableChains, tempusPools]);

  const cardsAvailable = useMemo(() => [...chainCardsMap.values()].flat().length > 0, [chainCardsMap]);

  return (
    <div className="tc__marketsPools-container">
      {cardsAvailable &&
        [...chainCardsMap.entries()].map(([chain, chainCards]) => {
          const prettyChainName = prettifyChainName(chain);

          // In case chain does not have any cards - skip showing it
          if (chainCards.length === 0) {
            return null;
          }

          return (
            <div key={chain}>
              <PoolsHeading text={`${prettyChainName}-Network pools`} />
              <PoolCardGrid chain={chain} cards={chainCards} cardVariant="markets" onCardClick={handleClick} />
            </div>
          );
        })}
      {!cardsAvailable && (
        <div className="tc__marketsPools-empty">
          <div className="tc__marketsPools-empty-content">
            <Typography variant="subtitle" weight="bold">
              {t('MarketsPools.emptyTitle')}
            </Typography>
            <Typography variant="subtitle">{t('MarketsPools.emptyDescription')}</Typography>
          </div>
        </div>
      )}
    </div>
  );
};
export default MarketsPools;
