export type TokenTypePrecision = 'backingToken' | 'yieldBearingToken' | 'principals' | 'yields' | 'lpTokens';

export type TokenPrecision = {
  backingToken?: number;
  yieldBearingToken?: number;
  principals?: number;
  yields?: number;
  lpTokens?: number;
};
