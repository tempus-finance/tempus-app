import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { WithdrawService } from './WithdrawService';

const withdrawServices = new Map<Chain, WithdrawService>();
export function getWithdrawService(chain: Chain, getConfig: ConfigGetter): WithdrawService {
  if (!withdrawServices.has(chain)) {
    withdrawServices.set(chain, new WithdrawService(chain, getConfig));
  }

  const withdrawService = withdrawServices.get(chain);
  if (!withdrawService) {
    throw new Error(`getWithdrawService() - Failed to get withdrawService for ${chain} chain!`);
  }

  return withdrawService;
}
