import { createState } from '@hookstate/core';
import { Chain, ChainConfig } from 'tempus-core-services';
import { getConfig } from '../utils/getConfig';

export const unsupportedNetworkState = createState<boolean | null>(null);

export interface StaticChainDataMap {
  [chainName: string]: ChainConfig;
}

// Static chain data state object
const staticChainDataStateInitialValue: StaticChainDataMap = {};

const configData = getConfig();

for (const chainName in configData) {
  staticChainDataStateInitialValue[chainName] = { ...configData[chainName as Chain] };
}

export const staticChainDataState = createState(staticChainDataStateInitialValue);
