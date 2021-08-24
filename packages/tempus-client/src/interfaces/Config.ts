import { Protocol } from './Protocol';
import { TempusPool } from './TempusPool';
import { Token } from './Token';

export type Config = {
  tokens: Token[];
  protocols: Protocol[];
  tempusPools: TempusPool[];
  statisticsContract: string;
  networkUrl: string;
};
