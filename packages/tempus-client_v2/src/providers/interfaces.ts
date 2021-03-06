import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain } from 'tempus-core-services';

export interface BalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}
