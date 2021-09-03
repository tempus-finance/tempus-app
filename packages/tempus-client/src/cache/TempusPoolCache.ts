import { BigNumber } from 'ethers';

export const protocolNameCache: Map<string, Promise<string>> = new Map();
export const maturityTimeCache: Map<string, Promise<BigNumber>> = new Map();
export const startTimeCache: Map<string, Promise<BigNumber>> = new Map();
export const backingTokenAddressCache: Map<string, Promise<string>> = new Map();
export const yieldBearingTokenAddressCache: Map<string, Promise<string>> = new Map();
export const yieldShareTokenAddressCache: Map<string, Promise<string>> = new Map();
export const principalShareTokenAddressCache: Map<string, Promise<string>> = new Map();
