import { Chain, NativeTokenTicker } from '../interfaces';

const chainToPrettyNameMap = {
  ethereum: 'Ethereum',
  fantom: 'Fantom',
  'ethereum-fork': 'Ethereum Fork',
  unsupported: 'Unsupported',
};

const chainToPrettyLongNameMap = {
  ethereum: 'Ethereum Mainnet',
  fantom: 'Fantom Opera',
  'ethereum-fork': 'Tempus Ethereum Fork',
  unsupported: 'Unsupported Network',
};

const chainToTickerMap = {
  ethereum: 'ETH',
  fantom: 'FTM',
  'ethereum-fork': 'ETH',
  unsupported: '',
};

const chainNameToHexChainIdMap = {
  ethereum: '0x1',
  fantom: '0xfa',
  'ethereum-fork': '0x7a69',
  unsupported: '',
};

const chainIdToChainNameMap = new Map<string, Chain>();
chainIdToChainNameMap.set('1', 'ethereum');
chainIdToChainNameMap.set('250', 'fantom');
chainIdToChainNameMap.set('31337', 'ethereum-fork');

const chainHexIdToChainNameMap = new Map<string, Chain>();
chainHexIdToChainNameMap.set('0x1', 'ethereum');
chainHexIdToChainNameMap.set('0xfa', 'fantom');
chainHexIdToChainNameMap.set('0x7a69', 'ethereum-fork');

export function prettifyChainName(chainName: Chain): string {
  return chainToPrettyNameMap[chainName];
}

export function prettifyChainNameLong(chainName: Chain): string {
  return chainToPrettyLongNameMap[chainName];
}

export function chainToTicker(chainName: Chain): NativeTokenTicker {
  return chainToTickerMap[chainName] as NativeTokenTicker;
}

export function chainNameToHexChainId(chainName: Chain): string {
  return chainNameToHexChainIdMap[chainName];
}

export function chainIdToChainName(chainId: string | number): Chain | undefined {
  return chainIdToChainNameMap.get(String(chainId));
}

export function chainIdHexToChainName(chainIdHex: string): Chain | undefined {
  return chainHexIdToChainNameMap.get(chainIdHex);
}
