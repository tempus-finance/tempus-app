import { FC, useCallback, useMemo } from 'react';
import { useSelectedChain, useUserDepositedPools, useTokenBalances } from '../../../hooks';
import { PoolCardData, PoolCardGrid } from '../../shared';
import PortfolioNoPositions from './PortfolioNoPositions';

import './PortfolioPositions.scss';

const PortfolioPositions: FC = () => {
  const tempusPools = useUserDepositedPools();
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

  return (
    <div className="tc__portfolio-positions">
      {chain && poolCards ? (
        <PoolCardGrid chain={chain} cards={poolCards} cardVariant="portfolio" onCardClick={handleClick} />
      ) : (
        <PortfolioNoPositions />
      )}
    </div>
  );
};

export default PortfolioPositions;
