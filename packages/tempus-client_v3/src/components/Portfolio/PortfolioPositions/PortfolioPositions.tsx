import { FC, useCallback, useMemo } from 'react';
import { usePoolList, useSelectedChain, useTokenBalances } from '../../../hooks';
import { PoolCardData, PoolCardGrid } from '../../shared';

const PortfolioPositions: FC = () => {
  const tempusPools = usePoolList();
  const chain = useSelectedChain();
  const balances = useTokenBalances();

  const poolCards = useMemo(
    () =>
      tempusPools
        .filter(tempusPool => tempusPool.chain === chain)
        .map(
          tempusPool =>
            ({
              chain: tempusPool.chain,
              token: tempusPool.backingToken,
              tokenAddress: tempusPool.backingTokenAddress,
              protocol: tempusPool.protocol,
              matured: tempusPool.maturityDate <= Date.now(),
              pools: [tempusPool],
              totalBalance: balances[`${chain}-${tempusPool.address}`],
            } as PoolCardData),
        ),
    [balances, chain, tempusPools],
  );

  const handleClick = useCallback(() => {}, []);

  if (!chain) {
    // TODO: add empty state page
    return null;
  }

  return (
    <div className="tc__portfolio-positions">
      <PoolCardGrid chain={chain} cards={poolCards} cardVariant="portfolio" onCardClick={handleClick} />
    </div>
  );
};

export default PortfolioPositions;
