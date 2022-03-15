import { Chain } from '../interfaces/Chain';

const chainIdToChainNameMap = new Map<number, Chain>();
chainIdToChainNameMap.set(1, 'ethereum');
chainIdToChainNameMap.set(250, 'fantom');

export default function getChainNameFromId(id: number): Chain | null {
  const chainName = chainIdToChainNameMap.get(id);
  if (!chainName) {
    return null;
  }

  return chainName;
}
