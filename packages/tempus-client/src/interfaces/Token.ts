export type Ticker = 'AAVE' | 'COMP' | 'DAI' | 'ETH' | 'LIDO' | 'TPS' | 'TYS' | 'TLPT' | 'TUSD' | 'stETH' | 'USDC';

export type Token = {
  ticker: Ticker;
  address: string;
};
