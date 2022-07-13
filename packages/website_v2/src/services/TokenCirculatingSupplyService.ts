import Axios from 'axios';
import { Decimal } from 'tempus-core-services';
import { REFRESH_TIME } from '../constants';

class TokenCirculatingSupplyService {
  private static value: Decimal | null = null;
  private static lastFetched: number | null = null;

  static async getCirculatingSupply(): Promise<Decimal | null> {
    try {
      if (
        !TokenCirculatingSupplyService.value ||
        (TokenCirculatingSupplyService.lastFetched &&
          TokenCirculatingSupplyService.lastFetched > Date.now() + REFRESH_TIME)
      ) {
        const result: any = await TokenCirculatingSupplyService.retrieveCirculatingSupply();

        TokenCirculatingSupplyService.value = new Decimal(result.data.circulatingSupply);
        TokenCirculatingSupplyService.lastFetched = Date.now();
      }

      return TokenCirculatingSupplyService.value;
    } catch {
      console.error('getCirculatingSupply - Failed to fetch TEMP circulating supply');
      return null;
    }
  }

  private static retrieveCirculatingSupply() {
    return Axios.post<any>('https://us-central1-temp-token-data.cloudfunctions.net/tempCirculatingSupplyDecimal');
  }
}
export default TokenCirculatingSupplyService;
