import { Decimal, Ticker } from 'tempus-core-services';

export interface TokenMetadata {
  precision: number;
  ticker: Ticker;
  rate: Decimal;
}

// Prop type that requires one or more entries to be provided,
// if user tries to provide empty array TS will throw an error
export type TokenMetadataProp = [TokenMetadata, ...TokenMetadata[]];
