import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { UserDepositsService } from './UserDepositsService';

const userDepositsServices = new Map<Chain, UserDepositsService>();
export function getUserDepositsService(chain: Chain, getConfig: ConfigGetter): UserDepositsService {
  if (!userDepositsServices.get(chain)) {
    userDepositsServices.set(chain, new UserDepositsService(chain, getConfig));
  }

  const userDepositsService = userDepositsServices.get(chain);
  if (!userDepositsService) {
    throw new Error(`getUserDepositsService() - Failed to get userDepositsService for ${chain} chain!`);
  }

  return userDepositsService;
}
