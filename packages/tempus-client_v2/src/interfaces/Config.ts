import { Chain } from './Chain';
import { TempusPool } from './TempusPool';

export interface ChainConfig {
  tempusPools: TempusPool[];
  statisticsContract: string;
  tempusControllerContract: string;
  lidoOracle: string;
  vaultContract: string;
  networkUrl: string;
  networkName: string;
  alchemyKey: string;
  chainId: number;
  /**
   * Average block time on chain in seconds.
   */
  averageBlockTime: number;
  nativeToken: 'ETH' | 'FTM';
  blockExplorerName: 'Etherscan' | 'FTMScan';
}

export type Config = {
  [networkName in Chain]: ChainConfig;
};
