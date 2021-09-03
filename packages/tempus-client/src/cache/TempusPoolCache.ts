import { Ticker } from '../interfaces';

export const backingTokenAddressCache: Map<string, Promise<string>> = new Map();
export const backingTokenTickerCache: Map<string, Promise<Ticker>> = new Map();
