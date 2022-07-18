import Axios from 'axios';
import { TEMPUS_SUBGRAPH_MAINNET_URL, TEMPUS_SUBGRAPH_FANTOM_URL } from '../constants';

class TokenHoldersService {
  private static holdersCount: number | null = null;

  static async getHolderCount(): Promise<number> {
    // Reset holder count
    this.holdersCount = 0;

    try {
      await Promise.all([
        this.getHoldersForNetwork(TEMPUS_SUBGRAPH_MAINNET_URL),
        this.getHoldersForNetwork(TEMPUS_SUBGRAPH_FANTOM_URL),
      ]);
    } catch (error) {
      console.error('Failed to get token holder count!', error);
    }

    return this.holdersCount;
  }

  private static async getHoldersForNetwork(networkSubgraphUrl: string, lastId = '') {
    const pageSize = 1000;

    const {
      data: {
        data: { users },
      },
    } = await Axios.post(networkSubgraphUrl, {
      query: `
        query {
          users(first: ${pageSize}, where: { tempBalance_gt: 0, id_gt: "${lastId}" }) {
            id
            tempBalance
          }
        }
        `,
    });

    this.holdersCount += users.length;

    // Paginate if needed
    if (users.length === pageSize) {
      await this.getHoldersForNetwork(networkSubgraphUrl, users[users.length - 1].id);
    }
  }
}
export default TokenHoldersService;
