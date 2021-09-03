import { Ticker } from '../interfaces';

export const symbolCache: Map<string, Promise<Ticker>> = new Map();
