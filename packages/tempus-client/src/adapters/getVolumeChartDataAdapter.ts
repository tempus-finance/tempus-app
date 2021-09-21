import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusControllerService from '../services/getTempusControllerService';
import getTempusPoolService from '../services/getTempusPoolService';
import getVaultService from '../services/getVaultService';
import VolumeChartDataAdapter from './VolumeChartDataAdapter';

let volumeChartDataAdapter: VolumeChartDataAdapter;
const getVolumeChartDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VolumeChartDataAdapter => {
  if (!volumeChartDataAdapter) {
    volumeChartDataAdapter = new VolumeChartDataAdapter();
    volumeChartDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
      statisticsService: getStatisticsService(),
      tempusAMMService: getTempusAMMService(),
      tempusControllerService: getTempusControllerService(),
      tempusPoolService: getTempusPoolService(),
      vaultService: getVaultService(),
    });
  }

  if (signerOrProvider) {
    volumeChartDataAdapter.init({
      signerOrProvider: signerOrProvider,
      statisticsService: getStatisticsService(signerOrProvider),
      tempusAMMService: getTempusAMMService(signerOrProvider),
      tempusControllerService: getTempusControllerService(signerOrProvider),
      tempusPoolService: getTempusPoolService(signerOrProvider),
      vaultService: getVaultService(signerOrProvider),
    });
  }

  return volumeChartDataAdapter;
};

export default getVolumeChartDataAdapter;
