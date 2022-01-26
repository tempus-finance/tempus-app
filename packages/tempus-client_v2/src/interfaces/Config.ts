import { TempusPool } from './TempusPool';

export interface NetworkConfig {
  tempusPools: TempusPool[];
  statisticsContract: string;
  tempusControllerContract: string;
  lidoOracle: string;
  vaultContract: string;
  networkUrl: string;
  networkName: string;
  alchemyKey: string;
}

export type Config = {
  'ethereum-mainnet': NetworkConfig;
  'fantom-mainnet': NetworkConfig;
  localhost?: NetworkConfig;
};
