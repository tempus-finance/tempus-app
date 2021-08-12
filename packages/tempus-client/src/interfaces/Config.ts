import { PriceOracle } from './PriceOracle';
import { Protocol } from './Protocol';
import { TempusPool } from './TempusPool';
import { Token } from './Token';

export type Config = {
  tokens: Token[];
  protocols: Protocol[];
  tempusPools: TempusPool[];
  priceOracles: PriceOracle[];
  statisticsContract: string;
  networkUrl: string;
};
