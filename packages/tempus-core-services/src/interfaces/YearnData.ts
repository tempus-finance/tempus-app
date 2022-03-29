export interface YearnDataApy {
  composite: any;
  fees: {
    performance: any;
    withdrawal: any;
    management: any;
    keep_crv: any;
    cvx_keep_crv: any;
  };
  gross_apr: number;
  net_apy: number;
  points: {
    week_ago: number;
    month_ago: number;
    inception: number;
  };
  type: string;
}

export interface YearnDataToken {
  address: string;
  decimals: number;
  display_name: string;
  icon: string;
  name: string;
  symbol: string;
}

export interface YearnData {
  address: string;
  apy: YearnDataApy;
  decimals: number;
  display_name: string;
  emergency_shutdown: boolean;
  endorsed: boolean;
  icon: string;
  inception: number;
  migration: {
    available: boolean;
    address: string;
  };
  name: string;
  special: boolean;
  strategies: any[];
  symbol: string;
  token: YearnDataToken;
  tvl: {
    total_assets: number;
    price: number;
    tvl: number;
  };
  type: string;
  updated: number;
  version: string;
}
