import { Ticker } from '../interfaces';

class TempusPoolCache {
  public backingTokenAddress: Map<string, Promise<string>> = new Map();
  public backingTokenTicker: Map<string, Promise<Ticker>> = new Map();
}
export default new TempusPoolCache();
