export type Ticker = 'aave' | 'comp' | 'dai' | 'eth' | 'tusd' | 'usdc';

export type Token = {
  ticker: Ticker;
  address: string;
};
