import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain } from '../interfaces';
import { ConfigGetter } from './BaseService';
import { WithdrawService } from './WithdrawService';

const withdrawServices = new Map<Chain, WithdrawService>();
export function getWithdrawService(chain: Chain, getConfig: ConfigGetter, signer: JsonRpcSigner): WithdrawService {
  if (!withdrawServices.get(chain)) {
    withdrawServices.set(chain, new WithdrawService(chain, getConfig, signer));
  }

  const withdrawService = withdrawServices.get(chain);
  if (!withdrawService) {
    throw new Error(`getWithdrawService() - Failed to get withdrawService for ${chain} chain!`);
  }

  return withdrawService;
}
