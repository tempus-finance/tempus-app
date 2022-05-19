import { useMemo } from 'react';
import { Decimal, prettifyChainName, tokenColorMap } from 'tempus-core-services';
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

        const chainPools = tempusPools.filter(pool => pool.chain === chain);

        // In case chain does not have any pools - skip showing it
        if (chainPools.length === 0) {
          return null;
        }

        return (
          <div key={chain}>
            <PoolsHeading text={`${prettyChainName}-Network pools`} />
            <div className="tc__marketsPools">
              {chainPools.map(tempusPool => {
                const cardColor = tokenColorMap.get(tempusPool.backingToken);

                if (!cardColor) {
                  console.warn(`Missing ${tempusPool.backingToken} token color in tokenColorMap!`);
                }

                return (
                  <PoolCard
                    key={`${tempusPool.chain}-${tempusPool.address}`}
                    aprValues={[new Decimal(0.1)]}
                    color={cardColor || '#ffffff'}
                    poolCardStatus="Fixed"
                    poolCardVariant="markets"
                    ticker={tempusPool.backingToken}
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
