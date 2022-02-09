export type Chain = 'ethereum' | 'fantom';

const chainToPrettyNameMap = {
  ethereum: 'Ethereum',
  fantom: 'Fantom',
};
export function prettifyChainName(chainName: Chain): string {
  return chainToPrettyNameMap[chainName];
}
