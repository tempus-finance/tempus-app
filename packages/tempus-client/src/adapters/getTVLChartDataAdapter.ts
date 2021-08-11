// External libraries
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';

// Services
import getDefaultProvider from '../services/getDefaultProvider';

// Adapters
import TVLChartDataAdapter from './TVLChartDataAdapter';

let tvlChartDataAdapter: TVLChartDataAdapter;
const getTVLChartDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TVLChartDataAdapter => {
  if (!tvlChartDataAdapter) {
    tvlChartDataAdapter = new TVLChartDataAdapter();
    tvlChartDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    tvlChartDataAdapter.init({
      signerOrProvider: signerOrProvider,
    });
  }

  return tvlChartDataAdapter;
};

export default getTVLChartDataAdapter;
