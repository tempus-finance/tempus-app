import Axios from 'axios';
import { Decimal } from 'tempus-core-services';

class TokenPriceService {
  static async getPrice(): Promise<Decimal> {
    const result = await Axios.get<any>('https://api.coingecko.com/api/v3/simple/price?ids=tempus&vs_currencies=usd');

    return new Decimal(result.data.tempus.usd);
  }
}
export default TokenPriceService;
