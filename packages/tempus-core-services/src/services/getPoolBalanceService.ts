import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { PoolBalanceService } from './PoolBalanceService';

const poolBalanceServices = new Map<Chain, PoolBalanceService>();
export function getPoolBalanceService(chain: Chain, getConfig: ConfigGetter): PoolBalanceService {
  if (!poolBalanceServices.get(chain)) {
    poolBalanceServices.set(chain, new PoolBalanceService(chain, getConfig));
  }

  const poolBalanceService = poolBalanceServices.get(chain);
  if (!poolBalanceService) {
    throw new Error(`getPoolBalanceService() - Failed to get poolBalanceService for ${chain} chain!`);
  }

  return poolBalanceService;
}
