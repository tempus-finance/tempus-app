import Axios from 'axios';
import { Decimal } from 'tempus-core-services';
import { REFRESH_TIME } from '../constants';

class TokenPriceService {
  private static value: Decimal | null = null;
  private static lastFetched: number | null = null;

  static async getPrice(): Promise<Decimal | null> {
    try {
      if (
        !TokenPriceService.value ||
        (TokenPriceService.lastFetched && TokenPriceService.lastFetched > Date.now() + REFRESH_TIME)
      ) {
        const result: any = await TokenPriceService.retrievePrice();

        TokenPriceService.value = new Decimal(result.data.tempus.usd);
        TokenPriceService.lastFetched = Date.now();
      }

      return TokenPriceService.value;
    } catch {
      console.error('getPrice - Failed to fetch TEMP token price');
      return null;
    }
  }

  private static retrievePrice() {
    return Axios.get<any>('https://api.coingecko.com/api/v3/simple/price?ids=tempus&vs_currencies=usd');
  }
}
export default TokenPriceService;
