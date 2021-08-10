import { Ticker } from './Token';
export interface Asset {
  id: number;
  ticker: Ticker;
  minFixedAPY: number;
  maxFixedAPY: number;
  minVariableAPY: number;
  maxVariableAPY: number;
  TVL: number;
  volume24h: number;
}
