import { TempusPool } from './TempusPool';

export type Config = {
  tempusPools: TempusPool[];
  statisticsContract: string;
  tempusControllerContract: string;
  lidoOracle: string;
  vaultContract: string;
  networkUrl: string;
  networkName: string;
  alchemyKey: string;
  infuraKey: string;
};
