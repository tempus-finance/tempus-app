import { Protocol } from './Protocol';
import { Token } from './Token';

export type Config = {
  tokens: Token[];
  protocols: Protocol[];
  tempusPools: string[];
};
