import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Chain, Decimal, ProtocolName, Ticker, ZERO } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { useFixedAprs, usePoolBalance, useTokenRates } from '../../hooks';
import { PoolPositionModal } from './PoolPositionModal';

export const PoolPositionModalResolver: FC = () => {
  const { chain, ticker, protocol, poolAddress } = useParams();

  const poolBalanceData = usePoolBalance(poolAddress, chain as Chain);
  const tokenRates = useTokenRates();
  const fixedAprs = useFixedAprs();

  // TODO - Properly check if URL params have valid values - if not show an error page or redirect to root page

  const poolData = useMemo(() => {
    if (!poolAddress) {
      return null;
    }

    return getConfigManager().getPoolData(poolAddress);
  }, [poolAddress]);

  if (!poolData) {
    // TODO - Show 404 page (pool not found)
    return null;
  }

  return (
    // TODO - Replace dummy data with data from hooks
    <PoolPositionModal
      apr={fixedAprs[`${poolData.chain}-${poolData.address}`]}
      // TODO - Show loading indicator while balance is being loaded, instead of showing zero
      balance={poolBalanceData?.balanceInBackingToken || ZERO}
      chartData={[
        { x: new Date(2022, 3, 4), y: 10 },
        { x: new Date(2022, 4, 1), y: 20 },
      ]}
      profitLoss={new Decimal(2)}
      projectedTotalYield={new Decimal(3)}
      term={new Date(poolData.maturityDate)}
      tokenDecimals={poolData.decimalsForUI}
      tokenExchangeRate={tokenRates[`${poolData.chain}-${poolData.backingTokenAddress}`]}
      totalYieldEarned={new Decimal(2)}
      tokenTicker="ETH"
      chain={chain as Chain}
      address={poolAddress || ''}
      backingToken={ticker as Ticker}
      protocol={protocol as ProtocolName}
    />
  );
};
