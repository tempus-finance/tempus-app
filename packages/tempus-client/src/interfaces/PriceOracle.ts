export type PriceOracleName = 'aave' | 'compound';

export type PriceOracle = {
  name: PriceOracleName;
  address: string;
};
