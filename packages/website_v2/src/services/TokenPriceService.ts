import Axios from 'axios';
import { Decimal } from 'tempus-core-services';

class TokenPriceService {
  static async getPrice(): Promise<Decimal | null> {
    try {
      const result = await Axios.get<any>('https://api.coingecko.com/api/v3/simple/price?ids=tempus&vs_currencies=usd');

      return new Decimal(result.data.tempus.usd);
    } catch {
      console.error('getPrice - Failed to fetch TEMP token price');
      return null;
    }
  }
}
export default TokenPriceService;
