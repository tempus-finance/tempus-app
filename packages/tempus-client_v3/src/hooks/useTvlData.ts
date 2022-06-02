import { bind } from '@react-rxjs/core';
import { map, timer, BehaviorSubject } from 'rxjs';
import { getServices, Decimal, Chain, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const TVL_POLLING_INTERVAL_IN_MS = 60000;

interface PoolTVLDataMap {
  behaviorSubject: BehaviorSubject<Decimal | null>;
  chain: Chain;
  address: string;
  backingToken: Ticker;
}

// Map of BehaviorSubjects that will store one BehaviorSubject per pool
const poolTvlSubjectsMap = new Map<string, PoolTVLDataMap>();

// Create one BehaviorSubject per pool
const poolList = getConfigManager().getPoolList();
poolList.forEach(pool => {
  const poolChainAddressId = `${pool.chain}-${pool.address}`;

  poolTvlSubjectsMap.set(poolChainAddressId, {
    chain: pool.chain,
    address: pool.address,
    backingToken: pool.backingToken,
    behaviorSubject: new BehaviorSubject<Decimal | null>(null),
  });
});

// Create a hook for each pool BehaviorSubject
export const [usePoolTVLData] = bind((poolAddress: string, poolChain: Chain) => {
  const poolTVLData = poolTvlSubjectsMap.get(`${poolAddress}-${poolChain}`);
  if (!poolTVLData) {
    throw new Error(`Failed to get TVL data for pool ${poolAddress} on chain ${poolChain}`);
  }

  return poolTVLData.behaviorSubject;
});

// Fetch TVL data for all pools on each polling interval
timer(0, TVL_POLLING_INTERVAL_IN_MS)
  .pipe(
    map(() => {
      poolTvlSubjectsMap.forEach(poolTvlData => {
        console.log(`Fetching TVL data for pool ${poolTvlData.address} on chain ${poolTvlData.chain}`);

        const services = getServices(poolTvlData.chain);
        if (services) {
          const poolTvl$ = services.StatisticsService.totalValueLockedUSD(
            poolTvlData.chain,
            poolTvlData.address,
            poolTvlData.backingToken,
          );

          // Push new TVL value to the BehaviorSubject for each pool
          poolTvl$.pipe(map(tvl => poolTvlData.behaviorSubject.next(tvl)));
        }
      });
    }),
  )
  .subscribe();
