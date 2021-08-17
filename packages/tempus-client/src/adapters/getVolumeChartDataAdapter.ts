import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import VolumeChartDataAdapter from './VolumeChartDataAdapter';

let volumeChartDataAdapter: VolumeChartDataAdapter;
const getVolumeChartDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VolumeChartDataAdapter => {
  if (!volumeChartDataAdapter) {
    volumeChartDataAdapter = new VolumeChartDataAdapter();
    volumeChartDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    volumeChartDataAdapter.init({
      signerOrProvider: signerOrProvider,
    });
  }

  return volumeChartDataAdapter;
};

export default getVolumeChartDataAdapter;
