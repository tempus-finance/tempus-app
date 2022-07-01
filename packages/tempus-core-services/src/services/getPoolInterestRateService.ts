import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { PoolInterestRateService } from './PoolInterestRateService';

const poolInterestRateServices = new Map<Chain, PoolInterestRateService>();
export function getPoolInterestRateService(chain: Chain, getConfig: ConfigGetter): PoolInterestRateService {
  if (!poolInterestRateServices.get(chain)) {
    poolInterestRateServices.set(chain, new PoolInterestRateService(chain, getConfig));
  }

  const poolInterestRateService = poolInterestRateServices.get(chain);
  if (!poolInterestRateService) {
    throw new Error(`getPoolInterestRateService() - Failed to get poolInterestRateService for ${chain} chain!`);
  }

  return poolInterestRateService;
}
