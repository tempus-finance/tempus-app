import { useMemo } from 'react';
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
import { PoolCard, PoolsHeading } from '../../shared';
import './MarketsPools.scss';

interface CardData {
  chain: Chain;
  token: Ticker;
  tokenAddress: string;
  protocol: ProtocolName;
  pools: TempusPool[];
}

const MarketsPools = (): JSX.Element => {
  const navigate = useNavigate();
  const chains = useChainList();
  const tempusPools = useFilteredSortedPoolList();
  const selectedChain = useSelectedChain();

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

          const tokenCard = chainCards.find(
            card => card.token === pool.backingToken && card.protocol === pool.protocol,
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
                    chain={chainCard.chain}
                    onClick={handleClick}
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
