export type Ticker = 'aave' | 'comp' | 'dai' | 'eth' | 'lido' | 'tps' | 'tys' | 'tlpt' | 'tusd' | 'usdc' | 'aDAI';

export type Token = {
  ticker: Ticker;
  address: string;
};
