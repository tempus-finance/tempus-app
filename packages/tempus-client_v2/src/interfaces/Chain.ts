export type Chain = 'ethereum' | 'fantom';

const chainToPrettyNameMap = {
  ethereum: 'ETH Mainnet',
  fantom: 'FTM Opera',
};
export function prettifyChainName(chainName: Chain): string {
  return chainToPrettyNameMap[chainName];
}
