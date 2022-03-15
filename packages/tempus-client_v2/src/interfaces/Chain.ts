import { Ticker } from './Token';

export type Chain = 'ethereum' | 'fantom';

const chainToPrettyNameMap = {
  ethereum: 'Ethereum',
  fantom: 'Fantom',
};

const chainToPrettyLongNameMap = {
  ethereum: 'Ethereum Mainnet',
  fantom: 'Fantom Opera',
};

const chainToTickerMap = {
  ethereum: 'ETH',
  fantom: 'FANTOM',
};

const chainNameToHexChainIdMap = {
  ethereum: '0x1',
  fantom: '0xfa',
};

const chainIdToChainNameMap = new Map<string, Chain>();
chainIdToChainNameMap.set('1', 'ethereum');
chainIdToChainNameMap.set('250', 'fantom');

export function prettifyChainName(chainName: Chain): string {
  return chainToPrettyNameMap[chainName];
}

export function prettifyChainNameLong(chainName: Chain): string {
  return chainToPrettyLongNameMap[chainName];
}

export function chainToTicker(chainName: Chain): Ticker {
  return chainToTickerMap[chainName] as Ticker;
}

export function chainNameToHexChainId(chainName: Chain): string {
  return chainNameToHexChainIdMap[chainName];
}

export function chainIdToChainName(chainId: string): Chain | undefined {
  return chainIdToChainNameMap.get(chainId);
}
