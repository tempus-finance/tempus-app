import { FC, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Chain, ProtocolName, Ticker, ZERO } from 'tempus-core-services';
import { useSelectedChain, useUserDepositedPools, usePoolBalances, useWalletAddress } from '../../../hooks';
import { GroupedPoolCardGrid, PoolCardData, PoolCardGroupId, PoolCardStatus } from '../../shared';
import PortfolioNoPositions from './PortfolioNoPositions';
import PortfolioPositionsWalletNotConnected from './PortfolioPositionsWalletNotConnected';

import './PortfolioPositions.scss';

const PortfolioPositions: FC = () => {
  const navigate = useNavigate();

  const tempusPools = useUserDepositedPools();
  const balances = usePoolBalances();
  const [walletAddress] = useWalletAddress();
  const [chain] = useSelectedChain();

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
          totalBalance: balances[`${chain}-${tempusPool.address}`]?.balanceInBackingToken ?? ZERO,
        });
      });

    return groups;
  }, [balances, chain, tempusPools]);

  const handleCardClick = useCallback(
    (cardChain: Chain, ticker: Ticker, protocol: ProtocolName, _status: PoolCardStatus, poolAddresses: string[]) => {
      if (poolAddresses.length === 1) {
        const poolAddress = poolAddresses[0];

        navigate(`/portfolio/positions/${cardChain}/${ticker}/${protocol}/${poolAddress}`);
      }
      // TODO - If position card has multiple pools we need to open sub-position screen
      // that contains cards for each pool (deploy multiple pools with same Protocol and Ticker)
    },
    [navigate],
  );

  return (
    <div className="tc__portfolio-positions">
      {/* Wallet connected and user has pool positions */}
      {chain && cardGroups.size && (
        <GroupedPoolCardGrid
          chain={chain}
          cardGroups={cardGroups}
          groupHeading="All Positions"
          onCardClick={handleCardClick}
        />
      )}

      {/* Wallet connected user does not have pool positions */}
      {walletAddress && !cardGroups.size && <PortfolioNoPositions />}

      {/* Wallet not connected */}
      {!walletAddress && <PortfolioPositionsWalletNotConnected />}
      <Outlet />
    </div>
  );
};

export default PortfolioPositions;
