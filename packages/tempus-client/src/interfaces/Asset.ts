export interface Asset {
  id: number;
  ticker: string;
  minFixedAPY: number;
  maxFixedAPY: number;
  minVariableAPY: number;
  maxVariableAPY: number;
  TVL: number;
  volume24h: number;
}
