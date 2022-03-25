import { TempusPool } from './TempusPool';

export interface ChainConfig {
  tempusPools: TempusPool[];
  statisticsContract: string;
  tempusControllerContract: string;
  lidoOracle: string;
  vaultContract: string;
  publicNetworkUrl: string;
  privateNetworkUrl: string;
  networkName: string;
  alchemyKey: string;
  chainId: number;
  /**
   * Average block time on chain in seconds.
   */
  averageBlockTime: number;
  nativeToken: 'ETH' | 'FTM';
  nativeTokenPrecision: number;
  blockExplorerName: 'Etherscan' | 'FTMScan';
  blockExplorerUrl: string;
}

export type Config = {
  [chainName: string]: ChainConfig;
};
