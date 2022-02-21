import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain } from '../interfaces/Chain';

export interface BalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}
