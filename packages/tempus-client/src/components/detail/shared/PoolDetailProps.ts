import { JsonRpcSigner } from '@ethersproject/providers';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';

type PoolDetailProps = {
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
};

export default PoolDetailProps;
