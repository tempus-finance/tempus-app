import { Ticker } from './Token';

export type Chain = 'ethereum' | 'fantom';

const chainToPrettyNameMap = {
  ethereum: 'ETH Mainnet',
  fantom: 'FTM Opera',
};

const chainToPrettyLongNameMap = {
  ethereum: 'Ethereum Mainnet',
  fantom: 'Fantom Opera',
};

const chainToTickerMap = {
  ethereum: 'ETH',
  fantom: 'FANTOM',
};

export function prettifyChainName(chainName: Chain): string {
  return chainToPrettyNameMap[chainName];
}

export function prettifyChainNameLong(chainName: Chain): string {
  return chainToPrettyLongNameMap[chainName];
}

export function chainToTicker(chainName: Chain): Ticker {
  return chainToTickerMap[chainName] as Ticker;
}
