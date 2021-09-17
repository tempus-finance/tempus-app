import { JsonRpcSigner } from '@ethersproject/providers';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';

type PoolDetailProps = {
  selectedTab: number;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
  content?: DashboardRowChild;
  poolDataAdapter?: PoolDataAdapter;
};

export default PoolDetailProps;
