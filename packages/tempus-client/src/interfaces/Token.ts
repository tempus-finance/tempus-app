export type Ticker =
  | 'AAVE'
  | 'COMP'
  | 'DAI'
  | 'ETH'
  | 'LIDO'
  | 'PRINCIPALS'
  | 'YIELDS'
  | 'TLPT'
  | 'TUSD'
  | 'stETH'
  | 'USDC'
  | 'aDAI';

export type Token = {
  ticker: Ticker;
  address: string;
};
