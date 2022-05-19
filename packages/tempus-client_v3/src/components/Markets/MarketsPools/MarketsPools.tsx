import { useMemo } from 'react';
import { Decimal, prettifyChainName, TempusPool, Ticker, tokenColorMap } from 'tempus-core-services';
import { useChainList, usePoolList, useSelectedChain } from '../../../hooks';
import { PoolCard, PoolsHeading } from '../../shared';
import './MarketsPools.scss';

const MarketsPools = (): JSX.Element => {
  const chains = useChainList();
  const tempusPools = usePoolList();
  const selectedChain = useSelectedChain();

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
        const chainCards: { token: Ticker; tokenAddress: string; pools: TempusPool[] }[] = [];
        tempusPools.forEach(pool => {
          // Skip pools from other chains
          if (pool.chain !== chain) {
            return;
          }

          const tokenCard = chainCards.find(card => card.token === pool.backingToken);
          if (tokenCard) {
            tokenCard.pools.push(pool);
          } else {
            chainCards.push({
              pools: [pool],
              token: pool.backingToken,
              tokenAddress: pool.backingTokenAddress,
            });
          }
        });

        // In case chain does not have any cards - skip showing it
        if (chainCards.length === 0) {
          return null;
        }

        return (
          <div key={chain}>
            <PoolsHeading text={`${prettyChainName}-Network pools`} />
            <div className="tc__marketsPools">
              {chainCards.map(chainCard => {
                const cardColor = tokenColorMap.get(chainCard.token);

                if (!cardColor) {
                  console.warn(`Missing ${chainCard.token} token color in tokenColorMap!`);
                }

                return (
                  <PoolCard
                    key={`${chain}-${chainCard.tokenAddress}`}
                    aprValues={[new Decimal(0.1)]}
                    color={cardColor || '#ffffff'}
                    poolCardStatus="Fixed"
                    poolCardVariant="markets"
                    ticker={chainCard.token}
                    protocol="aave"
                    terms={[new Date(4, 5, 2023)]}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default MarketsPools;
