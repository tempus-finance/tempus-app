import { BigNumber, ethers } from 'ethers';
import Axios from 'axios';
import { Ticker } from '../interfaces/Token';

const backingTokenToCoingeckoIdMap = new Map<string, string>([
  ['BTC', 'bitcoin'],
  ['ETH', 'ethereum'],
  ['DAI', 'dai'],
  ['USDC', 'usd-coin'],
  ['USDT', 'tether'],
  ['fUSDT', 'tether'],
  ['fUSDT', 'tether'],
  ['YFI', 'yearn-finance'],
  ['FTM', 'fantom'],
  ['FTM', 'fantom'],
  ['WBTC', 'wrapped-btc-wormhole'],
  ['WETH', 'weth'],
]);

const coinGeckoCache = new Map<string, { promise: Promise<any>; cachedAt: number }>();

export const getCoingeckoRate = async (token: Ticker, precision: number): Promise<BigNumber> => {
  const coinGeckoTokenId = backingTokenToCoingeckoIdMap.get(token);
  if (!coinGeckoTokenId) {
    return Promise.reject();
  }

  const cachedResponse = coinGeckoCache.get(coinGeckoTokenId);
  if (cachedResponse && cachedResponse.cachedAt > Date.now() - 60000) {
    return ethers.utils.parseUnits(
      (await cachedResponse.promise).data[coinGeckoTokenId].usd?.toString() ?? '0',
      precision,
    );
  }

  let value: BigNumber;
  try {
    const promise = Axios.get<any>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoTokenId}&vs_currencies=usd`,
    );

    coinGeckoCache.set(coinGeckoTokenId, {
      promise,
      cachedAt: Date.now(),
    });

    const result = await promise;

    const usdValue = result.data[coinGeckoTokenId].usd;
    value = ethers.utils.parseUnits(usdValue?.toString() ?? '0', precision);
  } catch (error) {
    console.error(`Failed to get token '${token}' exchange rate from coin gecko!`, error);
    if (['USDC', 'USDT', 'DAI'].includes(token)) {
      return ethers.utils.parseUnits('1.00', precision);
    }
    return Promise.reject(error);
  }

  return value;
};
