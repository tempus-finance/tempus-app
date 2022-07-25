import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { UserRedeemsService } from './UserRedeemsService';

const userRedeemsServices = new Map<Chain, UserRedeemsService>();
export function getUserRedeemsService(chain: Chain, getConfig: ConfigGetter): UserRedeemsService {
  if (!userRedeemsServices.get(chain)) {
    userRedeemsServices.set(chain, new UserRedeemsService(chain, getConfig));
  }

  const userRedeemsService = userRedeemsServices.get(chain);
  if (!userRedeemsService) {
    throw new Error(`getUserRedeemsService() - Failed to get userRedeemsServices for ${chain} chain!`);
  }

  return userRedeemsService;
}
