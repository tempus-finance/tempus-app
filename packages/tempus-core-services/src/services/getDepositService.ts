import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { DepositService } from './DepositService';

const depositServices = new Map<Chain, DepositService>();
export function getDepositService(chain: Chain, getConfig: ConfigGetter): DepositService {
  if (!depositServices.has(chain)) {
    depositServices.set(chain, new DepositService(chain, getConfig));
  }

  const depositService = depositServices.get(chain);
  if (!depositService) {
    throw new Error(`getDepositService() - Failed to get DepositService for ${chain} chain!`);
  }

  return depositService;
}
