import Axios from 'axios';
import { Decimal } from 'tempus-core-services';

class TokenCirculatingSupplyService {
  static async getCirculatingSupply(): Promise<Decimal | null> {
    try {
      const result = await Axios.post<any>(
        'https://us-central1-temp-token-data.cloudfunctions.net/tempCirculatingSupplyDecimal',
      );

      return new Decimal(result.data.circulatingSupply);
    } catch {
      console.error('getCirculatingSupply - Failed to fetch TEMP circulating supply');
      return null;
    }
  }
}
export default TokenCirculatingSupplyService;
