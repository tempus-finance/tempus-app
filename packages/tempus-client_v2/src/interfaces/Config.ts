import { TempusPool } from './TempusPool';

export interface BlockchainConfig {
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
  ethereum: BlockchainConfig;
  fantom: BlockchainConfig;
};
