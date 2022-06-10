import { FC, useCallback, useMemo } from 'react';
import { ZERO } from 'tempus-core-services';
import { useSelectedChain, useUserDepositedPools, useTokenBalances } from '../../../hooks';
import { GroupedPoolCardGrid, PoolCardData, PoolCardGroupId } from '../../shared';
import PortfolioNoPositions from './PortfolioNoPositions';

import './PortfolioPositions.scss';

const PortfolioPositions: FC = () => {
  const tempusPools = useUserDepositedPools();
  const [chain] = useSelectedChain();
  const balances = useTokenBalances();

  const cardGroups = useMemo(() => {
    const groups = new Map<PoolCardGroupId, PoolCardData[]>();

    tempusPools
      .filter(tempusPool => tempusPool.chain === chain)
      .forEach(tempusPool => {
        const isMatured = tempusPool.maturityDate <= Date.now();
        const uniqueGroupId: PoolCardGroupId = `${tempusPool.backingToken}-${tempusPool.protocol}-${
          isMatured ? 'Matured' : 'Fixed'
        }`;

        if (!groups.has(uniqueGroupId)) {
          groups.set(uniqueGroupId, []);
        }

        groups.get(uniqueGroupId)?.push({
          chain: tempusPool.chain,
          token: tempusPool.backingToken,
          tokenAddress: tempusPool.backingTokenAddress,
          protocol: tempusPool.protocol,
          matured: isMatured,
          pools: [tempusPool],
          totalBalance: balances[`${chain}-${tempusPool.principalsAddress}`] ?? ZERO,
        });
      });

    return groups;
  }, [balances, chain, tempusPools]);

  const handleCardClick = useCallback(() => {}, []);

  return (
    <div className="tc__portfolio-positions">
      {chain && cardGroups.size ? (
        <GroupedPoolCardGrid
          chain={chain}
          cardGroups={cardGroups}
          groupHeading="All Positions"
          onCardClick={handleCardClick}
        />
      ) : (
        <PortfolioNoPositions />
      )}
    </div>
  );
};

export default PortfolioPositions;
